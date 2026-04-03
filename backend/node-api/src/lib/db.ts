import pg from "pg";
import { encryptField, sha256 } from "./security.js";
import { addHours } from "./time.js";
import { Consultation, ConsultationResponse, Doctor, PatientProfile, PrescriptionItem } from "./types.js";
import { hashPassword, verifyPassword } from "./password.js";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://telemed:telemed@localhost:5432/telemed"
});

const DEFAULT_DOCTOR_CREDENTIALS = [
  {
    doctorId: "10000000-0000-0000-0000-000000000101",
    username: "dr.narin",
    password: "doctor123"
  },
  {
    doctorId: "10000000-0000-0000-0000-000000000102",
    username: "dr.pim",
    password: "doctor123"
  }
] as const;

let doctorAuthReadyPromise: Promise<void> | null = null;

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

export async function healthCheck(): Promise<boolean> {
  try {
    const result = await pool.query("SELECT 1");
    return result.rowCount === 1;
  } catch {
    return false;
  }
}

function isValidUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

async function ensureDoctorAuthReady(): Promise<void> {
  if (!doctorAuthReadyPromise) {
    doctorAuthReadyPromise = (async () => {
      await pool.query("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS username TEXT");
      await pool.query("ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash TEXT");
      await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_username_unique ON app_users (LOWER(username)) WHERE username IS NOT NULL");

      for (const credential of DEFAULT_DOCTOR_CREDENTIALS) {
        const result = await pool.query<{ user_id: string; username: string | null; password_hash: string | null }>(
          `SELECT d.user_id, u.username, u.password_hash
           FROM doctors d
           JOIN app_users u ON u.id = d.user_id
           WHERE d.id = $1`,
          [credential.doctorId]
        );

        if (result.rows.length === 0) {
          continue;
        }

        const row = result.rows[0];
        if (row.username && row.password_hash) {
          continue;
        }

        await pool.query(
          `UPDATE app_users
           SET username = COALESCE(username, $2),
               password_hash = COALESCE(password_hash, $3)
           WHERE id = $1`,
          [row.user_id, credential.username, hashPassword(credential.password)]
        );
      }
    })().catch((error) => {
      doctorAuthReadyPromise = null;
      throw error;
    });
  }

  return doctorAuthReadyPromise;
}

function parseRedFlags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  return [];
}

async function getImageUrls(consultationId: string): Promise<string[]> {
  const imagesResult = await pool.query<{ public_url: string }>(
    "SELECT public_url FROM consultation_images WHERE consultation_id = $1 ORDER BY uploaded_at ASC",
    [consultationId]
  );

  return imagesResult.rows.map((row: { public_url: string }) => row.public_url);
}

async function getLatestConsultationResponse(consultationId: string): Promise<{
  diagnosis?: string;
  advice?: string;
  respondedAt?: string;
  prescriptionItems?: PrescriptionItem[];
} | null> {
  const responseResult = await pool.query<{
    id: string;
    diagnosis: string;
    advice: string;
    responded_at: string;
  }>(
    `SELECT id, diagnosis, advice, responded_at
     FROM consultation_responses
     WHERE consultation_id = $1
     ORDER BY responded_at DESC
     LIMIT 1`,
    [consultationId]
  );

  if (responseResult.rows.length === 0) {
    return null;
  }

  const responseRow = responseResult.rows[0];

  const itemsResult = await pool.query<{
    medication_name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
  }>(
    `SELECT pi.medication_name, pi.dosage, pi.frequency, pi.duration_days
     FROM prescriptions p
     JOIN prescription_items pi ON pi.prescription_id = p.id
     WHERE p.consultation_response_id = $1
     ORDER BY pi.medication_name ASC`,
    [responseRow.id]
  );

  return {
    diagnosis: responseRow.diagnosis,
    advice: responseRow.advice,
    respondedAt: responseRow.responded_at,
    prescriptionItems: itemsResult.rows.map((row: { medication_name: string; dosage: string; frequency: string; duration_days: number }) => ({
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      durationDays: row.duration_days
    }))
  };
}

async function buildConsultation(row: {
  id: string;
  patient_id: string;
  province_code: string;
  specialty: string;
  status: string;
  priority_score: number;
  chief_complaint: string;
  symptom_duration_days: number;
  red_flags: unknown;
  assigned_doctor_id: string | null;
  submitted_at: string;
  first_response_due_at: string;
  completion_due_at: string;
}): Promise<Consultation> {
  const [imageUrls, latestResponse] = await Promise.all([
    getImageUrls(row.id),
    getLatestConsultationResponse(row.id)
  ]);

  return {
    id: row.id,
    patientId: row.patient_id,
    provinceCode: row.province_code,
    specialty: row.specialty as "dermatology",
    status: row.status as Consultation["status"],
    priorityScore: row.priority_score,
    chiefComplaint: row.chief_complaint,
    symptomDurationDays: row.symptom_duration_days,
    redFlags: parseRedFlags(row.red_flags),
    imageUrls,
    assignedDoctorId: row.assigned_doctor_id ?? undefined,
    submittedAt: row.submitted_at,
    firstResponseDueAt: row.first_response_due_at,
    completionDueAt: row.completion_due_at,
    diagnosis: latestResponse?.diagnosis,
    advice: latestResponse?.advice,
    prescriptionItems: latestResponse?.prescriptionItems,
    respondedAt: latestResponse?.respondedAt
  };
}

export async function verifyDoctorCredentials(input: {
  username: string;
  password: string;
}): Promise<{ doctor: Doctor; activeProvinceCode: string } | null> {
  await ensureDoctorAuthReady();

  const result = await pool.query<{
    id: string;
    display_name: string;
    specialty: string;
    province_codes: string[];
    password_hash: string | null;
  }>(
    `SELECT d.id, u.display_name, d.specialty,
            ARRAY_AGG(dpc.province_code ORDER BY dpc.province_code) AS province_codes,
            u.password_hash
     FROM doctors d
     JOIN app_users u ON u.id = d.user_id
     LEFT JOIN doctor_province_coverage dpc ON dpc.doctor_id = d.id
     WHERE d.active = TRUE AND LOWER(u.username) = LOWER($1)
     GROUP BY d.id, u.display_name, d.specialty, u.password_hash`,
    [input.username.trim()]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  if (!row.password_hash || !verifyPassword(input.password, row.password_hash)) {
    return null;
  }

  const doctor: Doctor = {
    id: row.id,
    displayName: row.display_name,
    provinceCodes: row.province_codes ?? [],
    specialty: row.specialty as Doctor["specialty"]
  };

  const activeProvinceCode = doctor.provinceCodes[0];
  if (!activeProvinceCode) {
    return null;
  }

  return { doctor, activeProvinceCode };
}

export async function listDoctors(): Promise<Doctor[]> {
  await ensureDoctorAuthReady();

  const result = await pool.query<{
    id: string;
    display_name: string;
    specialty: string;
    province_codes: string[];
  }>(
    `SELECT d.id, u.display_name, d.specialty, ARRAY_AGG(dpc.province_code ORDER BY dpc.province_code) AS province_codes
     FROM doctors d
     JOIN app_users u ON u.id = d.user_id
     LEFT JOIN doctor_province_coverage dpc ON dpc.doctor_id = d.id
     WHERE d.active = TRUE
     GROUP BY d.id, u.display_name, d.specialty
     ORDER BY u.display_name ASC`
  );

  return result.rows.map((row: { id: string; display_name: string; specialty: string; province_codes: string[] }) => ({
    id: row.id,
    displayName: row.display_name,
    provinceCodes: row.province_codes ?? [],
    specialty: row.specialty as Doctor["specialty"]
  }));
}

export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  await ensureDoctorAuthReady();

  if (!isValidUuid(doctorId)) {
    return null;
  }

  const result = await pool.query<{
    id: string;
    display_name: string;
    specialty: string;
    province_codes: string[];
  }>(
    `SELECT d.id, u.display_name, d.specialty, ARRAY_AGG(dpc.province_code ORDER BY dpc.province_code) AS province_codes
     FROM doctors d
     JOIN app_users u ON u.id = d.user_id
     LEFT JOIN doctor_province_coverage dpc ON dpc.doctor_id = d.id
     WHERE d.id = $1 AND d.active = TRUE
     GROUP BY d.id, u.display_name, d.specialty`,
    [doctorId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    displayName: row.display_name,
    provinceCodes: row.province_codes ?? [],
    specialty: row.specialty as Doctor["specialty"]
  };
}

export async function createPatientProfile(input: {
  thaiId: string;
  firstName: string;
  lastName: string;
  phone: string;
  lineUserId: string;
  provinceCode: string;
  encryptionKey: string;
}): Promise<PatientProfile> {
  const id = uuidv4();
  const thaiIdHash = sha256(input.thaiId);
  const encryptedFirstName = encryptField(input.firstName, input.encryptionKey);
  const encryptedLastName = encryptField(input.lastName, input.encryptionKey);
  const encryptedPhone = encryptField(input.phone, input.encryptionKey);

  await pool.query<{
    id: string;
    thai_id_hash: string;
    encrypted_first_name: string;
    encrypted_last_name: string;
    encrypted_phone: string;
    line_user_id: string;
    province_code: string;
  }>(
    `INSERT INTO patients (id, thai_id_hash, encrypted_first_name, encrypted_last_name, encrypted_phone, line_user_id, province_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, thai_id_hash, encrypted_first_name, encrypted_last_name, encrypted_phone, line_user_id, province_code`,
    [id, thaiIdHash, encryptedFirstName, encryptedLastName, encryptedPhone, input.lineUserId, input.provinceCode]
  );

  return {
    id,
    thaiIdHash,
    encryptedFirstName,
    encryptedLastName,
    encryptedPhone,
    lineUserId: input.lineUserId,
    provinceCode: input.provinceCode
  };
}

export async function findPatientByThaiId(thaiId: string): Promise<PatientProfile | null> {
  const thaiIdHash = sha256(thaiId);
  const result = await pool.query<{
    id: string;
    thai_id_hash: string;
    encrypted_first_name: string;
    encrypted_last_name: string;
    encrypted_phone: string;
    line_user_id: string;
    province_code: string;
  }>("SELECT * FROM patients WHERE thai_id_hash = $1", [thaiIdHash]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    thaiIdHash: row.thai_id_hash,
    encryptedFirstName: row.encrypted_first_name,
    encryptedLastName: row.encrypted_last_name,
    encryptedPhone: row.encrypted_phone,
    lineUserId: row.line_user_id,
    provinceCode: row.province_code
  };
}

export async function createConsultation(input: {
  patientId: string;
  provinceCode: string;
  chiefComplaint: string;
  symptomDurationDays: number;
  redFlags: string[];
  imageUrls: string[];
}): Promise<Consultation> {
  const id = uuidv4();
  const submittedAt = new Date();
  const priorityScore = Math.min(100, 40 + input.redFlags.length * 20 + Math.max(0, 14 - input.symptomDurationDays));
  const firstResponseDueAt = addHours(submittedAt, 4);
  const completionDueAt = addHours(submittedAt, 24);

  let patientId = input.patientId;
  if (!isValidUuid(input.patientId)) {
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO app_users (id, role, display_name) VALUES ($1, 'patient', 'Mock Patient')`,
      [userId]
    );

    patientId = uuidv4();
    await pool.query(
      `INSERT INTO patient_profiles (id, user_id, thai_id_hash, first_name_encrypted, last_name_encrypted, phone_encrypted, line_user_id, province_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [patientId, userId, sha256(`mock-${patientId}`), "Mock", "Patient", "00000000000", `line-${patientId}`, input.provinceCode]
    );
  }

  await pool.query(
    `INSERT INTO consultations (
      id, patient_id, province_code, specialty, status, priority_score,
      chief_complaint, symptom_duration_days, red_flags,
      submitted_at, first_response_due_at, completion_due_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      id,
      patientId,
      input.provinceCode,
      "dermatology",
      "submitted",
      priorityScore,
      input.chiefComplaint,
      input.symptomDurationDays,
      JSON.stringify(input.redFlags),
      submittedAt.toISOString(),
      firstResponseDueAt.toISOString(),
      completionDueAt.toISOString()
    ]
  );

  for (const imageUrl of input.imageUrls) {
    await pool.query(
      `INSERT INTO consultation_images (id, consultation_id, storage_key, public_url, uploaded_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), id, `images/${id}/${uuidv4()}`, imageUrl, submittedAt.toISOString()]
    );
  }

  return {
    id,
    patientId,
    provinceCode: input.provinceCode,
    specialty: "dermatology",
    status: "submitted",
    priorityScore,
    chiefComplaint: input.chiefComplaint,
    symptomDurationDays: input.symptomDurationDays,
    redFlags: input.redFlags,
    imageUrls: input.imageUrls,
    submittedAt: submittedAt.toISOString(),
    firstResponseDueAt: firstResponseDueAt.toISOString(),
    completionDueAt: completionDueAt.toISOString()
  };
}

export async function listConsultations(): Promise<Consultation[]> {
  const result = await pool.query<{
    id: string;
    patient_id: string;
    province_code: string;
    specialty: string;
    status: string;
    priority_score: number;
    chief_complaint: string;
    symptom_duration_days: number;
    red_flags: unknown;
    assigned_doctor_id: string | null;
    submitted_at: string;
    first_response_due_at: string;
    completion_due_at: string;
  }>("SELECT * FROM consultations ORDER BY submitted_at DESC");

  return Promise.all(result.rows.map(buildConsultation));
}

export async function getConsultationById(id: string): Promise<Consultation | null> {
  const result = await pool.query<{
    id: string;
    patient_id: string;
    province_code: string;
    specialty: string;
    status: string;
    priority_score: number;
    chief_complaint: string;
    symptom_duration_days: number;
    red_flags: unknown;
    assigned_doctor_id: string | null;
    submitted_at: string;
    first_response_due_at: string;
    completion_due_at: string;
  }>("SELECT * FROM consultations WHERE id = $1", [id]);

  if (result.rows.length === 0) return null;

  return buildConsultation(result.rows[0]);
}

export async function getDoctorQueue(provinceCodes: string[]): Promise<Consultation[]> {
  const result = await pool.query<{
    id: string;
    patient_id: string;
    province_code: string;
    specialty: string;
    status: string;
    priority_score: number;
    chief_complaint: string;
    symptom_duration_days: number;
    red_flags: unknown;
    assigned_doctor_id: string | null;
    submitted_at: string;
    first_response_due_at: string;
    completion_due_at: string;
  }>(
    "SELECT * FROM consultations WHERE province_code = ANY($1) AND status IN ('submitted', 'triaged', 'in_review', 'awaiting_patient') ORDER BY priority_score DESC, submitted_at ASC",
    [provinceCodes]
  );

  return Promise.all(result.rows.map(buildConsultation));
}

export async function claimConsultation(input: {
  consultationId: string;
  doctorId: string;
}): Promise<Consultation | null> {
  if (!isValidUuid(input.doctorId)) {
    return null;
  }

  const result = await pool.query<{
    id: string;
    patient_id: string;
    province_code: string;
    specialty: string;
    status: string;
    priority_score: number;
    chief_complaint: string;
    symptom_duration_days: number;
    red_flags: unknown;
    assigned_doctor_id: string | null;
    submitted_at: string;
    first_response_due_at: string;
    completion_due_at: string;
  }>(
    "UPDATE consultations SET status = 'in_review', assigned_doctor_id = $1 WHERE id = $2 RETURNING *",
    [input.doctorId, input.consultationId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return buildConsultation(result.rows[0]);
}

export async function respondToConsultation(input: {
  consultationId: string;
  doctorId: string;
  diagnosis: string;
  advice: string;
  escalated: boolean;
  prescriptionItems: PrescriptionItem[];
}): Promise<ConsultationResponse | null> {
  if (!isValidUuid(input.doctorId)) {
    return null;
  }

  const responseId = uuidv4();
  const respondedAt = new Date();

  const consultationUpdate = await pool.query(
    "UPDATE consultations SET status = $1, assigned_doctor_id = $2 WHERE id = $3 RETURNING id",
    [input.escalated ? "escalated" : "completed", input.doctorId, input.consultationId]
  );

  if (consultationUpdate.rows.length === 0) {
    return null;
  }

  await pool.query(
    `INSERT INTO consultation_responses (id, consultation_id, doctor_id, diagnosis, advice, escalated, responded_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [responseId, input.consultationId, input.doctorId, input.diagnosis, input.advice, input.escalated, respondedAt.toISOString()]
  );

  if (input.prescriptionItems.length > 0) {
    const prescriptionId = uuidv4();
    await pool.query(
      "INSERT INTO prescriptions (id, consultation_response_id, issued_at) VALUES ($1, $2, $3)",
      [prescriptionId, responseId, respondedAt.toISOString()]
    );

    for (const item of input.prescriptionItems) {
      await pool.query(
        `INSERT INTO prescription_items (id, prescription_id, medication_name, dosage, frequency, duration_days)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), prescriptionId, item.medicationName, item.dosage, item.frequency, item.durationDays]
      );
    }
  }

  return {
    id: responseId,
    consultationId: input.consultationId,
    doctorId: input.doctorId,
    diagnosis: input.diagnosis,
    advice: input.advice,
    escalated: input.escalated,
    prescriptionItems: input.prescriptionItems,
    respondedAt: respondedAt.toISOString()
  };
}

export async function getRoutingCoverage(provinceCodes: string[]): Promise<{ provinceCode: string; doctorCount: number }[]> {
  const result = await pool.query<{ province_code: string; count: string }>(
    "SELECT province_code, COUNT(*) as count FROM doctor_province_coverage WHERE province_code = ANY($1) GROUP BY province_code",
    [provinceCodes]
  );

  return result.rows.map((row: { province_code: string; count: string }) => ({
    provinceCode: row.province_code,
    doctorCount: parseInt(row.count, 10)
  }));
}

export async function getSlaSnapshot(): Promise<{ status: string; count: number; avgWaitMinutes: number }[]> {
  const result = await pool.query<{
    status: string;
    count: string;
    avg_wait: string | null;
  }>(
    "SELECT status, COUNT(*) as count, AVG(EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 60) as avg_wait FROM consultations GROUP BY status"
  );

  return result.rows.map((row: { status: string; count: string; avg_wait: string | null }) => ({
    status: row.status,
    count: parseInt(row.count, 10),
    avgWaitMinutes: row.avg_wait ? parseFloat(row.avg_wait) : 0
  }));
}
