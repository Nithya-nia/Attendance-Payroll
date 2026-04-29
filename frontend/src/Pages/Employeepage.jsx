import { useState } from "react";

function EmployeePage() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [checkedIn, setCheckedIn] = useState(false);

  // Dummy data (later replace with API)
  const attendanceData = [
    { date: "01-Apr", login: "9:00 AM", logout: "6:00 PM", hours: "9" },
    { date: "02-Apr", login: "9:15 AM", logout: "6:00 PM", hours: "8.5" },
  ];

  const salary = {
    presentDays: 22,
    lopDays: 3,
    overtime: 10,
    net: 25000,
  };

  return (
    <div className="container mt-4">

      <h3 className="text-center mb-4">Employee Dashboard</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "attendance" && "active"}`}
            onClick={() => setActiveTab("attendance")}>
            Attendance
          </button>
        </li>

        <li className="nav-item">
          <button className={`nav-link ${activeTab === "salary" && "active"}`}
            onClick={() => setActiveTab("salary")}>
            Salary
          </button>
        </li>

        <li className="nav-item">
          <button className={`nav-link ${activeTab === "payslip" && "active"}`}
            onClick={() => setActiveTab("payslip")}>
            Payslip
          </button>
        </li>
      </ul>

      {/* ================= ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div>

          {/* Check In / Out */}
          <div className="card p-4 shadow text-center mb-4">
            {!checkedIn ? (
              <button
                className="btn btn-success btn-lg"
                onClick={() => setCheckedIn(true)}
              >
                Check In
              </button>
            ) : (
              <button
                className="btn btn-danger btn-lg"
                onClick={() => setCheckedIn(false)}
              >
                Check Out
              </button>
            )}
          </div>

          {/* Attendance Table */}
          <div className="card shadow p-3">
            <h5>Monthly Attendance</h5>

            <table className="table table-bordered mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((a, i) => (
                  <tr key={i}>
                    <td>{a.date}</td>
                    <td>{a.login}</td>
                    <td>{a.logout}</td>
                    <td>{a.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SALARY ================= */}
      {activeTab === "salary" && (
        <div className="card shadow p-4">
          <h5>Salary Details</h5>

          <p>Present Days: {salary.presentDays}</p>
          <p>LOP Days: {salary.lopDays}</p>
          <p>Overtime: {salary.overtime} hrs</p>

          <h4 className="text-success">Net Salary: ₹{salary.net}</h4>
        </div>
      )}

      {/* ================= PAYSLIP ================= */}
      {activeTab === "payslip" && (
        <div className="card shadow p-4">
          <h3 className="text-center">Payslip</h3>
          <hr />

          <p><strong>Name:</strong> Employee</p>
          <p><strong>Month:</strong> April</p>

          <table className="table">
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td>₹20000</td>
              </tr>
              <tr>
                <td>LOP Deduction</td>
                <td>-₹2000</td>
              </tr>
              <tr>
                <td>Overtime</td>
                <td>₹3000</td>
              </tr>
            </tbody>
          </table>

          <h4 className="text-end text-primary">Net: ₹21000</h4>

          <button className="btn btn-outline-primary w-100 mt-3">
            Download Payslip
          </button>
        </div>
      )}

    </div>
  );
}

export default EmployeePage;