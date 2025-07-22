import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Components/Dashboard";
import Header from "./Components/Header";
import Receipts from "./Components/Receipts";

const App = () => {
  const location = useLocation();

  return (
    <div>
      {" "}
      {location.pathname !== "/login" && <Header />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/receipts" element={<Receipts />} />
      </Routes>
    </div>
  );
};

export default App;
