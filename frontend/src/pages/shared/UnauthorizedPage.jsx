import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="text-center">
      <h1 className="text-8xl font-black text-red-200">403</h1>
      <h2 className="text-2xl font-bold text-dark-900 mt-4 mb-2">Access Denied</h2>
      <p className="text-dark-500 mb-8">You don't have permission to access this page.</p>
      <Link to="/" className="btn-primary">Go to Dashboard</Link>
    </div>
  </div>
);

export default UnauthorizedPage;
