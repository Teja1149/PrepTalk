import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft">
        <p className="text-gray-600">Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
