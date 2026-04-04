import { addHours, addMinutes } from "./time.js";
import { Consultation, ConsultationResponse, Doctor, PatientProfile } from "./types.js";

export const doctors: Doctor[] = [
  {
    id: "doctor-bkk-1",
    displayName: "Dr. Narin S.",
    provinceCodes: ["10", "11", "12"],
    specialty: "dermatology"
  },
  {
    id: "doctor-cm-1",
    displayName: "Dr. Pimchanok K.",
    provinceCodes: ["50", "51", "52"],
    specialty: "dermatology"
  }
];

export const patients: PatientProfile[] = [];

const now = new Date("2026-04-02T09:00:00.000Z");

export const consultations: Consultation[] = [
  {
    id: "consult-001",
    patientId: "patient-001",
    provinceCode: "10",
    latitude: 13.7563,
    longitude: 100.5018,
    specialty: "dermatology",
    status: "submitted",
    priorityScore: 82,
    chiefComplaint: "Itchy red rash on both arms",
    symptomDurationDays: 5,
    redFlags: ["spreading-rash"],
    imageUrls: ["https://example.com/demo-rash-1.jpg"],
    submittedAt: now.toISOString(),
    firstResponseDueAt: addHours(now, 4).toISOString(),
    completionDueAt: addHours(now, 24).toISOString()
  },
  {
    id: "consult-002",
    patientId: "patient-002",
    provinceCode: "50",
    latitude: 18.7883,
    longitude: 98.9853,
    specialty: "dermatology",
    status: "in_review",
    priorityScore: 68,
    chiefComplaint: "Acne flare with irritation",
    symptomDurationDays: 14,
    redFlags: [],
    imageUrls: ["https://example.com/demo-acne-1.jpg"],
    assignedDoctorId: "doctor-cm-1",
    submittedAt: addMinutes(now, -80).toISOString(),
    firstResponseDueAt: addHours(addMinutes(now, -80), 4).toISOString(),
    completionDueAt: addHours(addMinutes(now, -80), 24).toISOString()
  }
];

export const consultationResponses: ConsultationResponse[] = [];

