import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Components/Dashboard";
import Header from "./Components/Header";
import Receipts from "./Components/Receipts";
import ProtectedRoute from "./Components/ProtectedRoute";
import useUserInfo from "./CustomHooks/useUserInfo";

const App = () => {
  const location = useLocation();
  const userInfo = useUserInfo();

  return (
    <div>
      {" "}
      {location.pathname !== "/login" && <Header />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute userInfo={userInfo}>
              <Receipts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
