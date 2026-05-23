import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageDoctors from '../pages/admin/ManageDoctors';
import ManagePatients from '../pages/admin/ManagePatients';
import ManageReceptionists from '../pages/admin/ManageReceptionists';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ManageAppointments from '../pages/admin/ManageAppointments';
import ManageRooms from '../pages/admin/ManageRooms';
import ManageBilling from '../pages/admin/ManageBilling';
import ManageAdmissions from '../pages/admin/ManageAdmissions';

// Doctor
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import AppointmentDetail from '../pages/doctor/AppointmentDetail';
import DoctorProfile from '../pages/doctor/DoctorProfile';

// Receptionist
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import RegisterPatient from '../pages/receptionist/RegisterPatient';
import BookAppointment from '../pages/receptionist/BookAppointment';
import ReceptionistBilling from '../pages/receptionist/ReceptionistBilling';

// Patient
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientBookAppointment from '../pages/patient/PatientBookAppointment';
import PatientPrescriptions from '../pages/patient/PatientPrescriptions';
import PatientBilling from '../pages/patient/PatientBilling';
import PatientProfile from '../pages/patient/PatientProfile';
import PatientMedicalRecords from '../pages/patient/PatientMedicalRecords';

// Shared
import NotFoundPage from '../pages/shared/NotFoundPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';

const getDashboardRoute = (role) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'doctor': return '/doctor/dashboard';
    case 'receptionist': return '/receptionist/dashboard';
    case 'patient': return '/patient/dashboard';
    default: return '/login';
  }
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <RegisterPage />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardRoute(user?.role) : '/login'} replace />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="patients" element={<ManagePatients />} />
        <Route path="receptionists" element={<ManageReceptionists />} />
        <Route path="departments" element={<ManageDepartments />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="rooms" element={<ManageRooms />} />
        <Route path="billing" element={<ManageBilling />} />
        <Route path="admissions" element={<ManageAdmissions />} />
      </Route>

      {/* Doctor routes */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      {/* Receptionist routes */}
      <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['receptionist']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="register-patient" element={<RegisterPatient />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="billing" element={<ReceptionistBilling />} />
      </Route>

      {/* Patient routes */}
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="book-appointment" element={<PatientBookAppointment />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="billing" element={<PatientBilling />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
      </Route>

      {/* Shared */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
