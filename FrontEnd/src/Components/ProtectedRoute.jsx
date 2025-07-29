import { Navigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";

const ProtectedRoute = ({ children }) => {
  const userInfo = useUserInfo();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
