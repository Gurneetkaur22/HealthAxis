import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="text-center">
      <h1 className="text-8xl font-black text-primary-200">404</h1>
      <h2 className="text-2xl font-bold text-dark-900 mt-4 mb-2">Page Not Found</h2>
      <p className="text-dark-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
