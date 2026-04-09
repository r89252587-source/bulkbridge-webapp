import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "shopkeeper" | "wholesaler";
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E8453C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (!user?.userType) {
    return <Navigate to="/select-user-type" replace />;
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = user.userType === "shopkeeper" ? "/dashboard/shopkeeper" : "/wholesaler";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
