import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ userInfo, children }) => {
  if (!userInfo) {
    console.log("fdsa");

    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
