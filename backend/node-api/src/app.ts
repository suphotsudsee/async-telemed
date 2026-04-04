import cors from "cors";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import {
  claimConsultation as claimConsultationDb,
  createConsultation as createConsultationDb,
  createPatientProfile as createPatientProfileDb,
  getConsultationById as getConsultationByIdDb,
  getDoctorById as getDoctorByIdDb,
  getDoctorQueue as getDoctorQueueDb,
  getRoutingCoverage as getRoutingCoverageDb,
  getSlaSnapshot as getSlaSnapshotDb,
  healthCheck as dbHealthCheck,
  listDoctors as listDoctorsDb,
  listConsultations as listConsultationsDb,
  respondToConsultation as respondToConsultationDb,
  updateDoctorProvinceCoverage as updateDoctorProvinceCoverageDb,
  verifyDoctorCredentials as verifyDoctorCredentialsDb,
  verifyAdminCredentials as verifyAdminCredentialsDb
} from "./lib/db.js";
import {
  claimConsultation as claimConsultationMock,
  createConsultation as createConsultationMock,
  createPatientProfile as createPatientProfileMock,
  getConsultationById as getConsultationByIdMock,
  getDoctorById as getDoctorByIdMock,
  getDoctorQueue as getDoctorQueueMock,
  getRoutingCoverage as getRoutingCoverageMock,
  getSlaSnapshot as getSlaSnapshotMock,
  listDoctors as listDoctorsMock,
  listConsultations as listConsultationsMock,
  respondToConsultation as respondToConsultationMock,
  updateDoctorProvinceCoverage as updateDoctorProvinceCoverageMock,
  verifyDoctorCredentials as verifyDoctorCredentialsMock,
  verifyAdminCredentials as verifyAdminCredentialsMock
} from "./lib/domain.js";
import { generateToken, rateLimitByUser, requireAdmin, requireDoctor } from "./lib/auth.js";
import { requestOtp, verifyOtp } from "./lib/otp.js";
import { presignUpload } from "./lib/storage.js";
import { isValidThaiId } from "./lib/thaiid.js";

const USE_DATABASE = process.env.DATABASE_URL && process.env.DATABASE_URL !== "mock";

const createPatientProfile = USE_DATABASE ? createPatientProfileDb : createPatientProfileMock;
const createConsultation = USE_DATABASE ? createConsultationDb : createConsultationMock;
const listDoctors = USE_DATABASE ? listDoctorsDb : listDoctorsMock;
const listConsultations = USE_DATABASE ? listConsultationsDb : listConsultationsMock;
const getConsultationById = USE_DATABASE ? getConsultationByIdDb : getConsultationByIdMock;
const getDoctorById = USE_DATABASE ? getDoctorByIdDb : getDoctorByIdMock;
const getDoctorQueue = USE_DATABASE ? getDoctorQueueDb : getDoctorQueueMock;
const claimConsultation = USE_DATABASE ? claimConsultationDb : claimConsultationMock;
const respondToConsultation = USE_DATABASE ? respondToConsultationDb : respondToConsultationMock;
const getRoutingCoverage = USE_DATABASE ? getRoutingCoverageDb : getRoutingCoverageMock;
const getSlaSnapshot = USE_DATABASE ? getSlaSnapshotDb : getSlaSnapshotMock;
const updateDoctorProvinceCoverage = USE_DATABASE ? updateDoctorProvinceCoverageDb : updateDoctorProvinceCoverageMock;
const verifyDoctorCredentials = USE_DATABASE ? verifyDoctorCredentialsDb : verifyDoctorCredentialsMock;
const verifyAdminCredentials = USE_DATABASE ? verifyAdminCredentialsDb : verifyAdminCredentialsMock;

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
  imageUrls: z.array(z.string().url()).min(0).max(5).default([]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

const doctorLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

const adminLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

const doctorCoverageSchema = z.object({
  provinceCodes: z.array(z.string().length(2)).max(77)
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

const uploadPresignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().refine(
    (val) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].some((t) => val.includes(t)),
    { message: "Only image files allowed (jpeg, png, webp)" }
  ),
  prefix: z.string().optional()
});

export function createApp() {
  const app = express();

  const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const defaultCorsOrigins = [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176',
    'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180',
    'http://localhost:5181', 'http://localhost:5182', 'http://localhost:5183', 'http://localhost:5184',
    'http://localhost:5185', 'http://localhost:4173', 'http://localhost:4174', 'http://localhost:4175'
  ];

  const allowAnyOrigin = configuredCorsOrigins.includes('*');
  const corsOrigins = configuredCorsOrigins.length > 0 ? configuredCorsOrigins.filter((item) => item !== '*') : defaultCorsOrigins;

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowAnyOrigin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.options('*', cors());
  app.use(express.json({ limit: '10mb' }));

  app.get("/health", async (_request, response) => {
    if (USE_DATABASE) {
      const dbOk = await dbHealthCheck();
      response.json({
        status: dbOk ? "ok" : "degraded",
        service: "node-api",
        database: dbOk ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
      return;
    }

    response.json({
      status: "ok",
      service: "node-api",
      database: "mock",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/v1/auth/thai-id/request-otp", rateLimitByUser({ maxRequests: 5, windowMs: 300000 }), async (request, response) => {
    const payload = authRequestSchema.safeParse(request.body);
    if (!payload.success || !isValidThaiId(payload.data.thaiId)) {
      return response.status(400).json({ message: "Invalid Thai ID or phone number." });
    }

    try {
      const otpResult = await requestOtp(payload.data.thaiId, payload.data.phone);
      return response.json({
        requestId: otpResult.requestId,
        expiresInSeconds: otpResult.expiresInSeconds,
        maskedPhone: otpResult.maskedPhone,
        ...(otpResult.code ? { demoCode: otpResult.code } : {})
      });
    } catch (error) {
      console.error("OTP request failed:", error);
      return response.status(500).json({ message: "Failed to send OTP." });
    }
  });

  app.post("/api/v1/auth/thai-id/verify", rateLimitByUser({ maxRequests: 3, windowMs: 300000 }), async (request, response) => {
    const payload = authVerifySchema.safeParse(request.body);
    if (!payload.success || !isValidThaiId(payload.data.thaiId)) {
      return response.status(400).json({ message: "Invalid request." });
    }

    const verifyResult = await verifyOtp(payload.data.thaiId, payload.data.otp);
    if (!verifyResult.success) {
      return response.status(400).json({ message: verifyResult.message });
    }

    try {
      const patient = await createPatientProfile({
        ...payload.data,
        encryptionKey: process.env.ENCRYPTION_KEY ?? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      });

      const token = generateToken({
        sub: patient.id,
        role: "patient",
        provinceCode: patient.provinceCode
      });

      return response.json({
        token,
        patientId: patient.id,
        role: "patient"
      });
    } catch (error) {
      console.error("Patient creation failed:", error);
      return response.status(500).json({ message: "Failed to create patient profile." });
    }
  });

  app.post("/api/v1/consultations", async (request, response) => {
    const payload = consultationSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const consultation = await createConsultation(payload.data);
      return response.status(201).json(consultation);
    } catch (error) {
      console.error("Consultation creation failed:", error);
      return response.status(500).json({ message: "Failed to create consultation." });
    }
  });

  app.get("/api/v1/consultations", async (_request, response) => {
    try {
      const consultations = await listConsultations();
      response.json(consultations);
    } catch (error) {
      console.error("Failed to list consultations:", error);
      response.status(500).json({ message: "Failed to list consultations." });
    }
  });

  app.get("/api/v1/consultations/:id", async (request, response) => {
    try {
      const consultation = await getConsultationById(request.params.id);
      if (!consultation) {
        return response.status(404).json({ message: "Consultation not found." });
      }
      response.json(consultation);
    } catch (error) {
      console.error("Failed to get consultation:", error);
      response.status(500).json({ message: "Failed to get consultation." });
    }
  });

  app.post("/api/v1/uploads/presign", async (request, response) => {
    const payload = uploadPresignSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const result = await presignUpload(payload.data);
      response.json(result);
    } catch (error) {
      console.error("Failed to create upload presign:", error);
      response.status(500).json({ message: "Failed to create upload URL." });
    }
  });

  app.post("/api/v1/doctor/auth/login", async (request, response) => {
    const payload = doctorLoginSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const session = await verifyDoctorCredentials(payload.data);
      if (!session) {
        return response.status(401).json({ message: "Invalid username or password." });
      }

      const token = generateToken({
        sub: session.doctor.id,
        role: "doctor",
        provinceCode: session.activeProvinceCode
      });

      response.json({
        token,
        role: "doctor",
        activeProvinceCode: session.activeProvinceCode,
        doctor: session.doctor
      });
    } catch (error) {
      console.error("Doctor login failed:", error);
      response.status(500).json({ message: "Failed to sign in doctor." });
    }
  });

  app.get("/api/v1/doctor/queue", requireDoctor, async (request, response) => {
    try {
      const doctor = await getDoctorById(request.user!.sub);
      const provinceCodes = doctor?.provinceCodes?.filter(Boolean) ?? [];

      if (provinceCodes.length === 0) {
        return response.json([]);
      }

      const queue = await getDoctorQueue(provinceCodes);
      response.json(queue);
    } catch (error) {
      console.error("Failed to get doctor queue:", error);
      response.status(500).json({ message: "Failed to get queue." });
    }
  });

  app.post("/api/v1/doctor/queue/:consultationId/claim", requireDoctor, async (request, response) => {
    try {
      const consultation = await claimConsultation({
        consultationId: String(request.params.consultationId),
        doctorId: request.user!.sub
      });

      if (!consultation) {
        return response.status(404).json({ message: "Consultation not found." });
      }

      response.json(consultation);
    } catch (error) {
      console.error("Failed to claim consultation:", error);
      response.status(500).json({ message: "Failed to claim consultation." });
    }
  });

  app.post("/api/v1/doctor/consultations/:consultationId/respond", requireDoctor, async (request, response) => {
    const payload = doctorResponseSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const result = await respondToConsultation({
        consultationId: String(request.params.consultationId),
        doctorId: request.user!.sub,
        diagnosis: payload.data.diagnosis,
        advice: payload.data.advice,
        escalated: payload.data.escalated,
        prescriptionItems: payload.data.prescriptionItems
      });

      if (!result) {
        return response.status(404).json({ message: "Consultation not found." });
      }

      const consultation = await getConsultationById(String(request.params.consultationId));
      response.json({ response: result, consultation });
    } catch (error) {
      console.error("Failed to respond to consultation:", error);
      response.status(500).json({ message: "Failed to save doctor response." });
    }
  });

  app.post("/api/v1/admin/auth/login", async (request, response) => {
    const payload = adminLoginSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const session = await verifyAdminCredentials(payload.data);
      if (!session) {
        return response.status(401).json({ message: "Invalid username or password." });
      }

      const token = generateToken({
        sub: session.admin.id,
        role: "admin"
      });

      response.json({
        token,
        role: "admin",
        admin: session.admin
      });
    } catch (error) {
      console.error("Admin login failed:", error);
      response.status(500).json({ message: "Failed to sign in admin." });
    }
  });

  app.get("/api/v1/admin/sla", requireAdmin, async (_request, response) => {
    try {
      const items = await getSlaSnapshot();
      response.json({ generatedAt: new Date().toISOString(), items });
    } catch (error) {
      console.error("Failed to get SLA snapshot:", error);
      response.status(500).json({ message: "Failed to get SLA data." });
    }
  });

  app.get("/api/v1/admin/doctors", requireAdmin, async (_request, response) => {
    try {
      const doctors = await listDoctors();
      response.json(doctors);
    } catch (error) {
      console.error("Failed to list doctors:", error);
      response.status(500).json({ message: "Failed to load doctors." });
    }
  });

  app.put("/api/v1/admin/doctors/:doctorId/provinces", requireAdmin, async (request, response) => {
    const payload = doctorCoverageSchema.safeParse(request.body);
    if (!payload.success) {
      return response.status(400).json({ message: payload.error.flatten() });
    }

    try {
      const doctor = await updateDoctorProvinceCoverage(
        String(request.params.doctorId),
        Array.from(new Set(payload.data.provinceCodes.map((item) => item.trim()).filter(Boolean))).sort()
      );

      if (!doctor) {
        return response.status(404).json({ message: "Doctor not found." });
      }

      response.json(doctor);
    } catch (error) {
      console.error("Failed to update doctor coverage:", error);
      response.status(500).json({ message: "Failed to update doctor coverage." });
    }
  });

  app.get("/api/v1/admin/routing", async (request, response) => {
    const provinceCodes = String(request.query.provinces ?? "10,50")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      const items = await getRoutingCoverage(provinceCodes);
      response.json(items);
    } catch (error) {
      console.error("Failed to get routing coverage:", error);
      response.status(500).json({ message: "Failed to get routing coverage." });
    }
  });

  return app;
}
