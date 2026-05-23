require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('../models/index'); // load associations
const { connectDB } = require('../config/db');
const { User, Patient, Doctor, Receptionist, Department, Appointment, Prescription, Billing, Room, Admission, MedicalRecord } = require('../models/index');

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    // Delete in order to respect FK constraints
    await MedicalRecord.destroy({ where: {} });
    await Admission.destroy({ where: {} });
    await Billing.destroy({ where: {} });
    await Prescription.destroy({ where: {} });
    await Appointment.destroy({ where: {} });
    await Doctor.destroy({ where: {} });
    await Patient.destroy({ where: {} });
    await Receptionist.destroy({ where: {} });
    await Department.destroy({ where: {} });
    await Room.destroy({ where: {} });
    await User.destroy({ where: {} });

    // --- Departments ---
    console.log('🏥 Creating departments...');
    const dept1 = await Department.create({ name: 'Cardiology', description: 'Heart and cardiovascular system' });
    const dept2 = await Department.create({ name: 'Neurology', description: 'Brain and nervous system' });
    await Department.create({ name: 'Orthopedics', description: 'Bones, joints, and muscles' });

    // --- Admin ---
    console.log('👤 Creating admin...');
    await User.create({ name: 'Admin', email: 'admin@hospital.com', password: 'admin123', role: 'admin' });

    // --- Doctors ---
    console.log('🩺 Creating doctors...');
    const drSmithUser = await User.create({ name: 'Dr. Sarah Smith', email: 'dr.smith@hospital.com', password: 'doctor123', role: 'doctor' });
    const drJonesUser = await User.create({ name: 'Dr. Michael Jones', email: 'dr.jones@hospital.com', password: 'doctor123', role: 'doctor' });

    const drSmith = await Doctor.create({
      userId: drSmithUser.id, specialization: 'Cardiologist', departmentId: dept1.id,
      qualification: 'MD Cardiology', experience: 12, phone: '9876543210', consultationFee: 500,
      availabilityDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'], availabilityStart: '09:00', availabilityEnd: '17:00',
    });
    const drJones = await Doctor.create({
      userId: drJonesUser.id, specialization: 'Neurologist', departmentId: dept2.id,
      qualification: 'MD Neurology', experience: 8, phone: '9876543211', consultationFee: 600,
      availabilityDays: ['Monday','Wednesday','Friday'], availabilityStart: '10:00', availabilityEnd: '16:00',
    });

    // --- Receptionist ---
    console.log('💼 Creating receptionist...');
    const recepUser = await User.create({ name: 'Priya Sharma', email: 'reception@hospital.com', password: 'reception123', role: 'receptionist' });
    await Receptionist.create({ userId: recepUser.id, phone: '9876543212', shift: 'Morning' });

    // --- Patients ---
    console.log('🧑‍🤝‍🧑 Creating patients...');
    const johnUser = await User.create({ name: 'John Doe', email: 'john@email.com', password: 'patient123', role: 'patient' });
    const janeUser = await User.create({ name: 'Jane Wilson', email: 'jane@email.com', password: 'patient123', role: 'patient' });
    const bobUser = await User.create({ name: 'Bob Johnson', email: 'bob@email.com', password: 'patient123', role: 'patient' });

    const johnPatient = await Patient.create({
      userId: johnUser.id, age: 35, gender: 'Male', bloodGroup: 'O+', phone: '9876543213',
      addressStreet: '123 Main St', addressCity: 'Mumbai', addressState: 'Maharashtra', addressZipCode: '400001',
      emergencyName: 'Mary Doe', emergencyPhone: '9876543214', emergencyRelation: 'Wife',
      medicalHistory: 'Mild hypertension', isFullProfile: true,
    });
    const janePatient = await Patient.create({
      userId: janeUser.id, age: 28, gender: 'Female', bloodGroup: 'A+', phone: '9876543215',
      addressStreet: '456 Oak Ave', addressCity: 'Delhi', addressState: 'Delhi', addressZipCode: '110001',
      emergencyName: 'Tom Wilson', emergencyPhone: '9876543216', emergencyRelation: 'Husband',
      medicalHistory: 'No known allergies', isFullProfile: true,
    });
    const bobPatient = await Patient.create({
      userId: bobUser.id, age: 50, gender: 'Male', bloodGroup: 'B+', phone: '9876543217',
      addressStreet: '789 Pine Rd', addressCity: 'Bangalore', addressState: 'Karnataka', addressZipCode: '560001',
      emergencyName: 'Alice Johnson', emergencyPhone: '9876543218', emergencyRelation: 'Daughter',
      medicalHistory: 'Type 2 Diabetes', isFullProfile: true,
    });

    // --- Rooms ---
    console.log('🛏️  Creating rooms...');
    const room101 = await Room.create({
      roomNumber: '101', type: 'General', floor: 1, pricePerDay: 1000,
      beds: [{ bedNumber: '101-A', isOccupied: false }, { bedNumber: '101-B', isOccupied: false }, { bedNumber: '101-C', isOccupied: false }],
    });
    await Room.create({
      roomNumber: '201', type: 'Semi-Private', floor: 2, pricePerDay: 2500,
      beds: [{ bedNumber: '201-A', isOccupied: false }, { bedNumber: '201-B', isOccupied: false }],
    });
    await Room.create({ roomNumber: '301', type: 'Private', floor: 3, pricePerDay: 5000, beds: [{ bedNumber: '301-A', isOccupied: false }] });
    await Room.create({
      roomNumber: '401', type: 'ICU', floor: 4, pricePerDay: 8000,
      beds: [{ bedNumber: '401-A', isOccupied: false }, { bedNumber: '401-B', isOccupied: false }],
    });

    // --- Appointments ---
    console.log('📅 Creating appointments...');
    const now = new Date();
    const apt1 = await Appointment.create({
      patientId: johnPatient.id, doctorId: drSmith.id, departmentId: dept1.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      timeSlot: '10:00 AM', reason: 'Chest pain and shortness of breath', status: 'completed',
    });
    const apt2 = await Appointment.create({
      patientId: janePatient.id, doctorId: drJones.id, departmentId: dept2.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      timeSlot: '11:00 AM', reason: 'Recurring headaches', status: 'completed',
    });
    const apt3 = await Appointment.create({
      patientId: bobPatient.id, doctorId: drSmith.id, departmentId: dept1.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      timeSlot: '02:00 PM', reason: 'Routine checkup', status: 'confirmed',
    });
    await Appointment.create({
      patientId: johnPatient.id, doctorId: drJones.id, departmentId: dept2.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      timeSlot: '09:00 AM', reason: 'Follow-up consultation', status: 'pending',
    });

    // --- Prescriptions ---
    console.log('💊 Creating prescriptions...');
    await Prescription.create({
      patientId: johnPatient.id, doctorId: drSmith.id, appointmentId: apt1.id,
      medicines: [
        { name: 'Aspirin', dosage: '75mg', duration: '30 days', instructions: 'Take after meals' },
        { name: 'Atorvastatin', dosage: '10mg', duration: '30 days', instructions: 'Take at bedtime' },
      ],
      notes: 'Monitor blood pressure weekly',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    });
    await Prescription.create({
      patientId: janePatient.id, doctorId: drJones.id, appointmentId: apt2.id,
      medicines: [
        { name: 'Sumatriptan', dosage: '50mg', duration: '10 days', instructions: 'Take during migraine onset' },
        { name: 'Paracetamol', dosage: '500mg', duration: '5 days', instructions: 'As needed for pain' },
      ],
      notes: 'Avoid bright lights, maintain sleep schedule',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    });

    // --- Medical Records ---
    console.log('📋 Creating medical records...');
    await MedicalRecord.create({
      patientId: johnPatient.id, doctorId: drSmith.id, appointmentId: apt1.id,
      diagnosis: 'Mild angina pectoris', treatmentNotes: 'Started on antiplatelet therapy. ECG normal. Advised lifestyle modifications.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    });
    await MedicalRecord.create({
      patientId: janePatient.id, doctorId: drJones.id, appointmentId: apt2.id,
      diagnosis: 'Migraine without aura', treatmentNotes: 'Prescribed abortive therapy. Advised to maintain headache diary.',
      followUpDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    });

    // --- Billing ---
    console.log('💰 Creating billing records...');
    await Billing.create({
      patientId: johnPatient.id, appointmentId: apt1.id,
      items: [
        { description: 'Consultation Fee', category: 'consultation', amount: 500 },
        { description: 'ECG Test', category: 'test', amount: 800 },
        { description: 'Blood Test', category: 'test', amount: 600 },
      ],
      totalAmount: 1900, paymentStatus: 'paid', paymentMethod: 'card',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    });
    await Billing.create({
      patientId: janePatient.id, appointmentId: apt2.id,
      items: [
        { description: 'Consultation Fee', category: 'consultation', amount: 600 },
        { description: 'MRI Scan', category: 'test', amount: 3500 },
      ],
      totalAmount: 4100, paymentStatus: 'paid', paymentMethod: 'upi',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    });
    await Billing.create({
      patientId: bobPatient.id, appointmentId: apt3.id,
      items: [{ description: 'Consultation Fee', category: 'consultation', amount: 500 }],
      totalAmount: 500, paymentStatus: 'unpaid',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    });

    // --- Admission ---
    console.log('🏨 Creating admission...');
    const beds = room101.beds;
    beds[0].isOccupied = true;
    beds[0].patientId = bobPatient.id;
    await room101.update({ beds, status: 'available' });
    await Admission.create({
      patientId: bobPatient.id, roomId: room101.id, bedNumber: '101-A',
      doctorId: drSmith.id, reason: 'Observation for unstable blood sugar', status: 'admitted',
    });

    console.log('\n✅ Seed data created successfully!');
    console.log('──────────────────────────────────');
    console.log('Default Login Credentials:');
    console.log('──────────────────────────────────');
    console.log('Admin:        admin@hospital.com / admin123');
    console.log('Doctor 1:     dr.smith@hospital.com / doctor123');
    console.log('Doctor 2:     dr.jones@hospital.com / doctor123');
    console.log('Receptionist: reception@hospital.com / reception123');
    console.log('Patient 1:    john@email.com / patient123');
    console.log('Patient 2:    jane@email.com / patient123');
    console.log('Patient 3:    bob@email.com / patient123');
    console.log('──────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
