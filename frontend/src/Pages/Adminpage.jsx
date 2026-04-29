import { useState } from "react";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("employees");

  // Dummy data (replace with API later)
  const [employees, setEmployees] = useState([
    { name: "John", department: "IT", salary: 1000 },
  ]);

  const [attendance] = useState([
    { name: "John", date: "01-Apr", status: "Present" },
    { name: "John", date: "02-Apr", status: "Absent" },
  ]);

  const [salaryApproved, setSalaryApproved] = useState(false);

  // Add Employee
  const addEmployee = () => {
    setEmployees([
      ...employees,
      { name: "New Employee", department: "HR", salary: 800 },
    ]);
  };

  return (
    <div className="container mt-4">

      <h3 className="text-center mb-4">Admin Dashboard</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab==="employees" && "active"}`}
            onClick={() => setActiveTab("employees")}>
            Employees
          </button>
        </li>

        <li className="nav-item">
          <button className={`nav-link ${activeTab==="attendance" && "active"}`}
            onClick={() => setActiveTab("attendance")}>
            Attendance
          </button>
        </li>

        <li className="nav-item">
          <button className={`nav-link ${activeTab==="payroll" && "active"}`}
            onClick={() => setActiveTab("payroll")}>
            Payroll
          </button>
        </li>
      </ul>

      {/* ================= EMPLOYEE ================= */}
      {activeTab === "employees" && (
        <div className="card p-4 shadow">

          <div className="d-flex justify-content-between">
            <h5>Employee List</h5>
            <button className="btn btn-primary" onClick={addEmployee}>
              Add Employee
            </button>
          </div>

          <table className="table mt-3">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Salary/Day</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>₹{emp.salary}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2">
                      Update
                    </button>
                    <button className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* ================= ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div className="card p-4 shadow">

          <h5>Daily & Monthly Attendance</h5>

          <table className="table mt-3">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.date}</td>
                  <td>
                    <span className={`badge ${a.status==="Present" ? "bg-success" : "bg-danger"}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* ================= PAYROLL ================= */}
      {activeTab === "payroll" && (
        <div className="card p-4 shadow">

          <h5>Payroll Calculation</h5>

          <p>Present Days: 22</p>
          <p>LOP Days: 3</p>
          <p>Overtime: 10 hrs</p>

          <h4 className="text-success">Net Salary: ₹25000</h4>

          {/* Approve Button */}
          <button
            className={`btn mt-3 ${salaryApproved ? "btn-success" : "btn-primary"}`}
            onClick={() => setSalaryApproved(true)}
          >
            {salaryApproved ? "Approved ✅" : "Approve Salary"}
          </button>

          {/* Download Payslip */}
          {salaryApproved && (
            <button className="btn btn-outline-dark mt-3 ms-2">
              Download Payslip
            </button>
          )}

        </div>
      )}

    </div>
  );
}

export default AdminPage;