import Landing from "./Pages/Landingpage";
import AdminSignup from "./Pages/AdminSignup";
import EmployeeSignup from "./Pages/EmployeeSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeePage from "./pages/EmployeePage";
import AdminPage from "./pages/AdminPage";
import EmployeeLogin from "./pages/EmployeeLogin";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/employee-signup" element={<EmployeeSignup />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-page" element={<EmployeePage />} />
        <Route path="/admin-page" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;

