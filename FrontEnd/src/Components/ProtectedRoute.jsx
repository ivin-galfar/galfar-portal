import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ userInfo, children }) => {
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
