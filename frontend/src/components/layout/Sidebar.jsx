import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineOfficeBuilding, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlineHome, HiOutlineUser, HiOutlineDocumentText, HiOutlinePlusCircle, HiOutlineKey } from 'react-icons/hi';

const menuConfig = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/admin/doctors', label: 'Doctors', icon: HiOutlineUsers },
    { path: '/admin/patients', label: 'Patients', icon: HiOutlineUserGroup },
    { path: '/admin/receptionists', label: 'Receptionists', icon: HiOutlineKey },
    { path: '/admin/departments', label: 'Departments', icon: HiOutlineOfficeBuilding },
    { path: '/admin/appointments', label: 'Appointments', icon: HiOutlineCalendar },
    { path: '/admin/rooms', label: 'Rooms & Beds', icon: HiOutlineHome },
    { path: '/admin/billing', label: 'Billing', icon: HiOutlineCurrencyDollar },
    { path: '/admin/admissions', label: 'Admissions', icon: HiOutlineClipboardList },
  ],
  doctor: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/doctor/appointments', label: 'My Appointments', icon: HiOutlineCalendar },
    { path: '/doctor/profile', label: 'My Profile', icon: HiOutlineUser },
  ],
  receptionist: [
    { path: '/receptionist/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/receptionist/register-patient', label: 'Register Patient', icon: HiOutlinePlusCircle },
    { path: '/receptionist/book-appointment', label: 'Book Appointment', icon: HiOutlineCalendar },
    { path: '/receptionist/billing', label: 'Billing', icon: HiOutlineCurrencyDollar },
  ],
  patient: [
    { path: '/patient/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/patient/appointments', label: 'My Appointments', icon: HiOutlineCalendar },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: HiOutlinePlusCircle },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: HiOutlineDocumentText },
    { path: '/patient/medical-records', label: 'Medical Records', icon: HiOutlineClipboardList },
    { path: '/patient/billing', label: 'My Bills', icon: HiOutlineCurrencyDollar },
    { path: '/patient/profile', label: 'My Profile', icon: HiOutlineUser },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const menu = menuConfig[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-lg">H</div>
            <div>
              <h1 className="font-bold text-lg leading-none">HealthAxis</h1>
              <p className="text-[10px] text-dark-400 uppercase tracking-wider">Hospital System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 px-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
