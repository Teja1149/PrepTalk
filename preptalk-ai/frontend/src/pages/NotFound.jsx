import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 shadow-sm border text-center">
        <h1 className="text-4xl font-extrabold mb-3">Page not found</h1>

        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/dashboard"
          className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
