import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineMenuAlt2, HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const roleLabels = { admin: 'Administrator', doctor: 'Doctor', receptionist: 'Receptionist', patient: 'Patient' };
const roleColors = { admin: 'bg-purple-100 text-purple-700', doctor: 'bg-blue-100 text-blue-700', receptionist: 'bg-amber-100 text-amber-700', patient: 'bg-green-100 text-green-700' };

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100" id="sidebar-toggle">
          <HiOutlineMenuAlt2 className="w-6 h-6" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-dark-800">Welcome back,</h2>
          <p className="text-xs text-dark-500">{user?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[user?.role] || ''}`}>
          {roleLabels[user?.role] || user?.role}
        </span>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 text-dark-400 hover:text-red-500 transition-colors" title="Logout" id="logout-btn">
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
