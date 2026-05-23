-- ============================================================
-- Hospital Management System – PostgreSQL Init Schema
-- Run this once against your PostgreSQL database.
-- Replaces the old Supabase migration.
-- ============================================================

-- Role enum (matches backend User model)
CREATE TYPE app_role AS ENUM ('admin', 'doctor', 'patient', 'receptionist');

-- Users table (managed by the backend, NOT Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  role          app_role      NOT NULL DEFAULT 'patient',
  avatar        VARCHAR(500)  DEFAULT '',
  "isActive"    BOOLEAN       DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL UNIQUE,
  description   TEXT          DEFAULT '',
  status        VARCHAR(20)   DEFAULT 'active',
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "departmentId"      INTEGER       REFERENCES departments(id) ON DELETE SET NULL,
  specialization      VARCHAR(255)  NOT NULL,
  qualification       VARCHAR(255)  DEFAULT '',
  experience          INTEGER       DEFAULT 0,
  phone               VARCHAR(20)   DEFAULT '',
  "consultationFee"   NUMERIC(10,2) DEFAULT 0,
  "availabilityDays"  JSONB         DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
  "availabilityStart" VARCHAR(10)   DEFAULT '09:00',
  "availabilityEnd"   VARCHAR(10)   DEFAULT '17:00',
  "createdAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age                 INTEGER,
  gender              VARCHAR(10),
  "bloodGroup"        VARCHAR(5)    DEFAULT '',
  phone               VARCHAR(20)   DEFAULT '',
  "addressStreet"     VARCHAR(255)  DEFAULT '',
  "addressCity"       VARCHAR(100)  DEFAULT '',
  "addressState"      VARCHAR(100)  DEFAULT '',
  "addressZipCode"    VARCHAR(20)   DEFAULT '',
  "emergencyName"     VARCHAR(100)  DEFAULT '',
  "emergencyPhone"    VARCHAR(20)   DEFAULT '',
  "emergencyRelation" VARCHAR(50)   DEFAULT '',
  "medicalHistory"    TEXT          DEFAULT '',
  "isFullProfile"     BOOLEAN       DEFAULT FALSE,
  "createdAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Receptionists
CREATE TABLE IF NOT EXISTS receptionists (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone       VARCHAR(20) DEFAULT '',
  shift       VARCHAR(20) DEFAULT 'Morning',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id            SERIAL PRIMARY KEY,
  "roomNumber"  VARCHAR(20)   NOT NULL UNIQUE,
  type          VARCHAR(30)   DEFAULT 'General',
  floor         INTEGER       DEFAULT 1,
  "pricePerDay" NUMERIC(10,2) DEFAULT 0,
  beds          JSONB         DEFAULT '[]',
  status        VARCHAR(20)   DEFAULT 'available',
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id              SERIAL PRIMARY KEY,
  "patientId"     INTEGER       NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"      INTEGER       NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  "departmentId"  INTEGER       REFERENCES departments(id) ON DELETE SET NULL,
  date            TIMESTAMPTZ   NOT NULL,
  "timeSlot"      VARCHAR(20)   NOT NULL,
  reason          TEXT          DEFAULT '',
  status          VARCHAR(20)   DEFAULT 'pending',
  "createdAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id              SERIAL PRIMARY KEY,
  "patientId"     INTEGER     NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"      INTEGER     NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  "appointmentId" INTEGER     REFERENCES appointments(id) ON DELETE SET NULL,
  medicines       JSONB       DEFAULT '[]',
  notes           TEXT        DEFAULT '',
  date            TIMESTAMPTZ DEFAULT NOW(),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billings
CREATE TABLE IF NOT EXISTS billings (
  id              SERIAL PRIMARY KEY,
  "patientId"     INTEGER       NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "appointmentId" INTEGER       REFERENCES appointments(id) ON DELETE SET NULL,
  items           JSONB         DEFAULT '[]',
  "totalAmount"   NUMERIC(12,2) NOT NULL,
  "paymentStatus" VARCHAR(20)   DEFAULT 'unpaid',
  "paymentMethod" VARCHAR(20)   DEFAULT 'cash',
  date            TIMESTAMPTZ   DEFAULT NOW(),
  "createdAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Admissions
CREATE TABLE IF NOT EXISTS admissions (
  id              SERIAL PRIMARY KEY,
  "patientId"     INTEGER     NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "roomId"        INTEGER     NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  "doctorId"      INTEGER     REFERENCES doctors(id) ON DELETE SET NULL,
  "bedNumber"     VARCHAR(20) NOT NULL,
  "admitDate"     TIMESTAMPTZ DEFAULT NOW(),
  "dischargeDate" TIMESTAMPTZ,
  reason          TEXT        DEFAULT '',
  status          VARCHAR(20) DEFAULT 'admitted',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
  id               SERIAL PRIMARY KEY,
  "patientId"      INTEGER     NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"       INTEGER     NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  "appointmentId"  INTEGER     REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis        TEXT        NOT NULL,
  "treatmentNotes" TEXT        DEFAULT '',
  "followUpDate"   TIMESTAMPTZ,
  date             TIMESTAMPTZ DEFAULT NOW(),
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updatedAt on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','departments','doctors','patients','receptionists','rooms','appointments','prescriptions','billings','admissions','medical_records']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t, t
    );
  END LOOP;
END;
$$;
