
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/SupabaseAuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <div className="space-x-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Return to Dashboard
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
