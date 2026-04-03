CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE consultation_status AS ENUM ('submitted', 'triaged', 'in_review', 'awaiting_patient', 'completed', 'escalated');

CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    display_name TEXT NOT NULL,
    username TEXT NULL,
    password_hash TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id),
    thai_id_hash TEXT NOT NULL UNIQUE,
    first_name_encrypted TEXT NOT NULL,
    last_name_encrypted TEXT NOT NULL,
    phone_encrypted TEXT NOT NULL,
    line_user_id TEXT NOT NULL UNIQUE,
    province_code CHAR(2) NOT NULL,
    consent_version TEXT NOT NULL DEFAULT 'pdpa-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id),
    license_number TEXT NOT NULL UNIQUE,
    specialty TEXT NOT NULL DEFAULT 'dermatology',
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE doctor_province_coverage (
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    province_code CHAR(2) NOT NULL,
    PRIMARY KEY (doctor_id, province_code)
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    province_code CHAR(2) NOT NULL,
    specialty TEXT NOT NULL DEFAULT 'dermatology',
    status consultation_status NOT NULL DEFAULT 'submitted',
    priority_score INTEGER NOT NULL,
    chief_complaint TEXT NOT NULL,
    symptom_duration_days INTEGER NOT NULL,
    red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_response_due_at TIMESTAMPTZ NOT NULL,
    completion_due_at TIMESTAMPTZ NOT NULL,
    assigned_doctor_id UUID NULL REFERENCES doctors(id)
);

CREATE TABLE consultation_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consultation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    diagnosis TEXT NOT NULL,
    advice TEXT NOT NULL,
    escalated BOOLEAN NOT NULL DEFAULT FALSE,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_response_id UUID NOT NULL REFERENCES consultation_responses(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration_days INTEGER NOT NULL
);

CREATE TABLE sla_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    breached BOOLEAN NOT NULL DEFAULT FALSE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NULL REFERENCES app_users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_app_users_username_unique ON app_users (LOWER(username)) WHERE username IS NOT NULL;

CREATE INDEX idx_consultations_status_priority ON consultations(status, priority_score DESC);
CREATE INDEX idx_consultations_province_status ON consultations(province_code, status);
CREATE INDEX idx_sla_events_due_at ON sla_events(due_at);

