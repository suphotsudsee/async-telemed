import { v4 as uuidv4 } from "uuid";
import { consultations, consultationResponses, doctors, patients } from "./mock.js";
import { encryptField, sha256 } from "./security.js";
import { addHours } from "./time.js";
import { Consultation, ConsultationResponse, Doctor, PatientProfile, PrescriptionItem } from "./types.js";

function enrichConsultation(consultation: Consultation): Consultation {
  const response = [...consultationResponses]
    .filter((item) => item.consultationId === consultation.id)
    .sort((left, right) => new Date(right.respondedAt).getTime() - new Date(left.respondedAt).getTime())[0];

  if (!response) {
    return { ...consultation };
  }

  return {
    ...consultation,
    diagnosis: response.diagnosis,
    advice: response.advice,
    prescriptionItems: response.prescriptionItems,
    respondedAt: response.respondedAt
  };
}

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
  return consultations.map(enrichConsultation);
}

export function getConsultationById(consultationId: string): Consultation | undefined {
  const consultation = consultations.find((item) => item.id === consultationId);
  return consultation ? enrichConsultation(consultation) : undefined;
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

export function listDoctors(): Doctor[] {
  return doctors.map((doctor) => ({ ...doctor }));
}

export function updateDoctorProvinceCoverage(doctorId: string, provinceCodes: string[]): Doctor | undefined {
  const doctor = doctors.find((item) => item.id === doctorId);
  if (!doctor) {
    return undefined;
  }

  doctor.provinceCodes = [...provinceCodes];
  return { ...doctor };
}

export function getDoctorById(doctorId: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.id === doctorId);
}

export function getDoctorQueue(provinceCodes: string[]): Consultation[] {
  return consultations
    .filter((consultation) => provinceCodes.includes(consultation.provinceCode))
    .filter((consultation) => consultation.status === "submitted" || consultation.status === "triaged" || consultation.status === "in_review")
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .map(enrichConsultation);
}

export function claimConsultation(input: { consultationId: string; doctorId?: string }): Consultation | undefined {
  const consultation = consultations.find((item) => item.id === input.consultationId);
  if (!consultation) {
    return undefined;
  }
  consultation.assignedDoctorId = input.doctorId ?? "doctor-demo";
  consultation.status = "in_review";
  return enrichConsultation(consultation);
}

export function respondToConsultation(input: {
  consultationId: string;
  doctorId?: string;
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
  consultation.assignedDoctorId = input.doctorId ?? "doctor-demo";
  consultation.diagnosis = input.diagnosis;
  consultation.advice = input.advice;
  consultation.prescriptionItems = input.prescriptionItems;
  consultation.respondedAt = new Date().toISOString();

  const response: ConsultationResponse = {
    id: uuidv4(),
    consultationId: input.consultationId,
    doctorId: input.doctorId ?? "doctor-demo",
    diagnosis: input.diagnosis,
    advice: input.advice,
    prescriptionItems: input.prescriptionItems,
    escalated: input.escalated,
    respondedAt: consultation.respondedAt
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

export function verifyDoctorCredentials(input: {
  username: string;
  password: string;
}): { doctor: Doctor; activeProvinceCode: string } | null {
  const credentials: Record<string, string> = {
    'dr.narin': 'doctor123',
    'dr.pim': 'doctor123'
  };

  const doctor = input.username.trim().toLowerCase() === 'dr.narin'
    ? doctors.find((item) => item.id === 'doctor-bkk-1')
    : input.username.trim().toLowerCase() === 'dr.pim'
      ? doctors.find((item) => item.id === 'doctor-cm-1')
      : undefined;

  if (!doctor || credentials[input.username.trim().toLowerCase()] !== input.password) {
    return null;
  }

  return {
    doctor: { ...doctor },
    activeProvinceCode: doctor.provinceCodes[0]
  };
}


export function verifyAdminCredentials(input: {
  username: string;
  password: string;
}): { admin: { id: string; displayName: string } } | null {
  if (input.username.trim().toLowerCase() !== 'admin' || input.password !== 'admin123') {
    return null;
  }

  return {
    admin: {
      id: '00000000-0000-0000-0000-000000000201',
      displayName: 'Ops Admin'
    }
  };
}
