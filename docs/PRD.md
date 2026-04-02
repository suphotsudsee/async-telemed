# Product Requirements Document

## Product Name

Asynchronous Telemedicine System

## Problem

Patients in Thailand, especially outside major urban centers, face long waits for dermatology access. Synchronous teleconsultation is scheduling-heavy and unsuitable for low-bandwidth, image-first use cases. Providers also need operational visibility into turnaround times and provincial demand.

## Pilot Focus

Dermatology pilot with image-led asynchronous consultations distributed by province.

## Goals

- Allow patients to submit structured dermatology consultations from mobile devices through LINE LIFF.
- Route requests to licensed doctors based on province and service coverage.
- Maintain SLA visibility from intake to prescription or escalation.
- Protect personal and health data under PDPA using encryption and role-aware access.

## Primary Users

- Patient
- Doctor
- Operations admin

## Core User Flows

### Patient

1. Authenticate with Thai citizen ID and receive LIFF session.
2. Complete symptom form and upload skin images.
3. Submit consultation and receive status updates through LINE.
4. View doctor response and e-Prescription.

### Doctor

1. Open triage queue scoped to allowed provinces.
2. Claim queued consultation.
3. Review structured history and images.
4. Respond with assessment, advice, and prescription or escalation.

### Admin

1. Monitor SLA compliance by province and doctor.
2. Track queue depth and aging cases.
3. Manage routing coverage and operational settings.

## Functional Requirements

### Authentication

- Thai ID validation with checksum enforcement.
- LIFF login session binding to patient profile.
- OTP provider integration placeholder for production verification.

### Consultation Intake

- Structured dermatology form: chief complaint, symptom duration, allergies, medications, red flags.
- Minimum one image, maximum five images.
- Draft support is optional and excluded from pilot.

### Routing

- Province-specific doctor assignment pools.
- Priority scoring based on red flags and waiting time.
- Re-routing if no doctor claims within configurable SLA threshold.

### Clinical Workflow

- Queue statuses: `submitted`, `triaged`, `in_review`, `awaiting_patient`, `completed`, `escalated`.
- Doctor notes and diagnosis.
- e-Prescription with medication, dosage, frequency, and duration.

### Notifications

- LINE push for status changes, doctor questions, and prescription ready.
- Webhook endpoint to receive LIFF/LINE events.

### Compliance and Security

- Encrypt sensitive patient fields at rest.
- Audit key access events.
- Separate operational analytics from raw PHI where practical.

## Non-Functional Requirements

- Mobile-first UI
- Thai/English ready data model
- API-first design
- Local Docker Compose setup for pilot environments

## SLA Targets

- First doctor response within 4 hours during operating window
- Consultation completion within 24 hours
- Escalation if queue wait exceeds 2 hours unclaimed

## Out of Scope for Pilot

- Real-time video consults
- Insurance adjudication
- Payment collection
- Multi-specialty support beyond dermatology
