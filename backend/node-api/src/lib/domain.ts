import { v4 as uuidv4 } from "uuid";
import { consultations, consultationResponses, doctors, patients } from "./mock.js";
import { encryptField, sha256 } from "./security.js";
import { addHours } from "./time.js";
import { Consultation, ConsultationResponse, PatientProfile, PrescriptionItem } from "./types.js";

export function createPatientProfile(input: {
  thaiId: string;
  firstName: string;
  lastName: string;
  phone: string;
  lineUserId: string;
  provinceCode: string;
  encryptionKey: string;
}): PatientProfile {
  const patient: PatientProfile = {
    id: uuidv4(),
    thaiIdHash: sha256(input.thaiId),
    encryptedFirstName: encryptField(input.firstName, input.encryptionKey),
    encryptedLastName: encryptField(input.lastName, input.encryptionKey),
    encryptedPhone: encryptField(input.phone, input.encryptionKey),
    lineUserId: input.lineUserId,
    provinceCode: input.provinceCode
  };
  patients.push(patient);
  return patient;
}

export function listConsultations(): Consultation[] {
  return consultations;
}

export function getConsultationById(consultationId: string): Consultation | undefined {
  return consultations.find((item) => item.id === consultationId);
}

export function createConsultation(input: {
  patientId: string;
  provinceCode: string;
  chiefComplaint: string;
  symptomDurationDays: number;
  redFlags: string[];
  imageUrls: string[];
}): Consultation {
  const submittedAt = new Date();
  const priorityScore = Math.min(100, 40 + input.redFlags.length * 20 + Math.max(0, 14 - input.symptomDurationDays));
  const consultation: Consultation = {
    id: uuidv4(),
    patientId: input.patientId,
    provinceCode: input.provinceCode,
    specialty: "dermatology",
    status: "submitted",
    priorityScore,
    chiefComplaint: input.chiefComplaint,
    symptomDurationDays: input.symptomDurationDays,
    redFlags: input.redFlags,
    imageUrls: input.imageUrls,
    submittedAt: submittedAt.toISOString(),
    firstResponseDueAt: addHours(submittedAt, 4).toISOString(),
    completionDueAt: addHours(submittedAt, 24).toISOString()
  };
  consultations.unshift(consultation);
  return consultation;
}

export function getDoctorQueue(provinceCodes: string[]): Consultation[] {
  return consultations
    .filter((consultation) => provinceCodes.includes(consultation.provinceCode))
    .filter((consultation) => consultation.status === "submitted" || consultation.status === "triaged" || consultation.status === "in_review")
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

export function claimConsultation(consultationId: string, doctorId: string): Consultation | undefined {
  const consultation = consultations.find((item) => item.id === consultationId);
  if (!consultation) {
    return undefined;
  }
  consultation.assignedDoctorId = doctorId;
  consultation.status = "in_review";
  return consultation;
}

export function respondToConsultation(input: {
  consultationId: string;
  diagnosis: string;
  advice: string;
  prescriptionItems: PrescriptionItem[];
  escalated: boolean;
}): ConsultationResponse | undefined {
  const consultation = consultations.find((item) => item.id === input.consultationId);
  if (!consultation) {
    return undefined;
  }
  consultation.status = input.escalated ? "escalated" : "completed";
  const response: ConsultationResponse = {
    id: uuidv4(),
    consultationId: input.consultationId,
    diagnosis: input.diagnosis,
    advice: input.advice,
    prescriptionItems: input.prescriptionItems,
    escalated: input.escalated,
    respondedAt: new Date().toISOString()
  };
  consultationResponses.push(response);
  return response;
}

export function getRoutingCoverage() {
  return doctors.map((doctor) => ({
    doctorId: doctor.id,
    displayName: doctor.displayName,
    provinceCodes: doctor.provinceCodes,
    specialty: doctor.specialty
  }));
}

export function getSlaSnapshot(now = new Date()) {
  return consultations.map((consultation) => {
    const firstResponseMs = new Date(consultation.firstResponseDueAt).getTime() - now.getTime();
    const completionMs = new Date(consultation.completionDueAt).getTime() - now.getTime();
    return {
      consultationId: consultation.id,
      provinceCode: consultation.provinceCode,
      status: consultation.status,
      priorityScore: consultation.priorityScore,
      firstResponseRemainingMinutes: Math.round(firstResponseMs / 60000),
      completionRemainingMinutes: Math.round(completionMs / 60000),
      breached:
        (consultation.status === "submitted" || consultation.status === "triaged") && firstResponseMs < 0
    };
  });
}

