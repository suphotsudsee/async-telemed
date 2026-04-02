export type Role = "patient" | "doctor" | "admin";

export type ConsultationStatus =
  | "submitted"
  | "triaged"
  | "in_review"
  | "awaiting_patient"
  | "completed"
  | "escalated";

export interface SessionUser {
  id: string;
  role: Role;
  displayName: string;
  provinceCodes?: string[];
}

export interface PatientProfile {
  id: string;
  thaiIdHash: string;
  encryptedFirstName: string;
  encryptedLastName: string;
  encryptedPhone: string;
  lineUserId: string;
  provinceCode: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  provinceCode: string;
  specialty: "dermatology";
  status: ConsultationStatus;
  priorityScore: number;
  chiefComplaint: string;
  symptomDurationDays: number;
  redFlags: string[];
  imageUrls: string[];
  assignedDoctorId?: string;
  submittedAt: string;
  firstResponseDueAt: string;
  completionDueAt: string;
}

export interface Doctor {
  id: string;
  displayName: string;
  provinceCodes: string[];
  specialty: "dermatology";
}

export interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
}

export interface ConsultationResponse {
  id: string;
  consultationId: string;
  diagnosis: string;
  advice: string;
  prescriptionItems: PrescriptionItem[];
  escalated: boolean;
  respondedAt: string;
}

