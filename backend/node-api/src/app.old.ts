import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  claimConsultation,
  createConsultation,
  createPatientProfile,
  getConsultationById,
  getDoctorQueue,
  getRoutingCoverage,
  getSlaSnapshot,
  listConsultations,
  respondToConsultation
} from "./lib/domain.js";
import { isValidThaiId } from "./lib/thaiid.js";

const authRequestSchema = z.object({
  thaiId: z.string(),
  phone: z.string().min(8)
});

const authVerifySchema = z.object({
  thaiId: z.string(),
  otp: z.string().length(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(8),
  lineUserId: z.string().min(1),
  provinceCode: z.string().length(2)
});

const consultationSchema = z.object({
  patientId: z.string(),
  provinceCode: z.string().length(2),
  chiefComplaint: z.string().min(10),
  symptomDurationDays: z.number().int().min(0),
  redFlags: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).min(1).max(5)
});

const doctorResponseSchema = z.object({
  diagnosis: z.string().min(3),
  advice: z.string().min(3),
  escalated: z.boolean().default(false),
  prescriptionItems: z
    .array(
      z.object({
        medicationName: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        durationDays: z.number().int().min(1)
      })
    )
    .default([])
});

function getEncryptionKey() {
  return process.env.ENCRYPTION_KEY ??
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "node-api" });
  });

  app.post("/api/v1/auth/thai-id/request-otp", (request, response) => {
    const payload = authRequestSchema.safeParse(request.body);
    if (!payload.success || !isValidThaiId(payload.data.thaiId)) {
      return response.status(400).json({ message: "Invalid Thai ID or phone number." });
    }

    return response.json({
      requestId: "otp-demo-request",
      expiresInSeconds: 300,
      maskedPhone: payload.data.phone.replace(/.(?=.{4})/g, "x")
    });
  });

  app.post("/api/v1/auth/thai-id/verify", (request, response) => {
    const payload = authVerifySchema.safeParse(request.body);
    if (!payload.success || !isValidThaiId(payload.data.thaiId) || payload.data.otp !== "123456") {
      return response.status(400).json({ message: "Verification failed." });
    }

    const patient = createPatientProfile({
      ...payload.data,
      encryptionKey: getEncryptionKey()
    });

    const token = jwt.sign(
      {
        sub: patient.id,
        role: "patient",
        provinceCode: patient.provinceCode
      },
      process.env.JWT_SECRET ?? "replace-me",
      { expiresIn: "12h" }
    );

    return response.json({
      token,
      patientId: patient.id,
      role: "patient"
    });
  });

  app.get("/api/v1/auth/session", (_request, response) => {
    response.json({
      authenticated: true,
      role: "patient",
      displayName: "Demo Patient"
    });
  });

  app.post("/api/v1/consultations", (request, response) => {
    const payload = consultationSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    const consultation = createConsultation(payload.data);
    return response.status(201).json(consultation);
  });

  app.get("/api/v1/consultations", (_request, response) => {
    response.json(listConsultations());
  });

  app.get("/api/v1/consultations/:id", (request, response) => {
    const match = getConsultationById(request.params.id);
    if (!match) {
      return response.status(404).json({ message: "Consultation not found." });
    }
    return response.json(match);
  });

  app.post("/api/v1/uploads/presign", (_request, response) => {
    response.json({
      uploadUrl: "https://storage.example.com/presigned-upload",
      publicUrl: "https://storage.example.com/final-object.jpg",
      expiresInSeconds: 900
    });
  });

  app.get("/api/v1/doctor/queue", (request, response) => {
    const provinceCodes = String(request.query.provinces ?? "10,50")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    response.json(getDoctorQueue(provinceCodes));
  });

  app.post("/api/v1/doctor/queue/:consultationId/claim", (request, response) => {
    const consultation = claimConsultation({ consultationId: request.params.consultationId, doctorId: String(request.body.doctorId ?? "doctor-bkk-1") });
    if (!consultation) {
      return response.status(404).json({ message: "Consultation not found." });
    }
    return response.json(consultation);
  });

  app.post("/api/v1/doctor/consultations/:consultationId/respond", (request, response) => {
    const payload = doctorResponseSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    const result = respondToConsultation({
      consultationId: request.params.consultationId,
      ...payload.data
    });

    if (!result) {
      return response.status(404).json({ message: "Consultation not found." });
    }
    return response.json(result);
  });

  app.get("/api/v1/admin/sla", (_request, response) => {
    response.json({
      generatedAt: new Date().toISOString(),
      items: getSlaSnapshot()
    });
  });

  app.get("/api/v1/admin/routing", (_request, response) => {
    response.json(getRoutingCoverage());
  });

  app.post("/api/v1/webhooks/line", (request, response) => {
    const signature = request.header("x-line-signature");
    if (!signature) {
      return response.status(401).json({ message: "Missing LINE signature." });
    }
    return response.json({
      accepted: true,
      eventCount: Array.isArray(request.body?.events) ? request.body.events.length : 0
    });
  });

  return app;
}



