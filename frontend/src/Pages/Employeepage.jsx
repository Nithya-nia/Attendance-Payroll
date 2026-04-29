import { useEffect, useState } from "react";
import axios from "axios";

function EmployeePage() {
  const [user, setUser] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [hours, setHours] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  const handleCheckIn = async () => {
    const res = await axios.post("http://localhost:5000/check-in", {
      userId: user._id,
      name: user.name
    });
    setCheckInTime(res.data.checkInTime);
  };

  const handleCheckOut = async () => {
    const res = await axios.post("http://localhost:5000/check-out", {
      userId: user._id
    });
    setCheckOutTime(res.data.checkOutTime);
    setHours(res.data.totalHours);
  };

  return (
    <div className="d-flex" style={{ height: "100vh", background: "#f4f6f9" }}>

      {/* 🔵 Sidebar */}
      <div
        style={{
          width: "260px",
          background: "linear-gradient(180deg, #4e73df, #224abe)",
          color: "white",
          padding: "25px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h3 className="mb-4">👤 Employee</h3>

        <div className="mb-3">
          <small>Name</small>
          <h6>{user.name}</h6>
        </div>

        <div className="mb-3">
          <small>Email</small>
          <h6>{user.email}</h6>
        </div>

        <div className="mb-4">
          <small>Department</small>
          <h6>{user.department}</h6>
        </div>

        <button
          className="btn btn-light w-100"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/employee-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* 🟢 Main Content */}
      <div className="flex-grow-1 p-4">

        <h2 className="mb-3">Dashboard</h2>
        <p className="text-muted">Welcome back, <b>{user.name}</b> 👋</p>

        {/* 🔹 Action Cards */}
        <div className="row mt-4">

          <div className="col-md-6 mb-3">
            <div className="card shadow border-0 p-4 text-center">
              <h5>Check-In</h5>
              <button
                className="btn btn-success mt-2"
                onClick={handleCheckIn}
              >
                Check In
              </button>
             {checkInTime && (
              <div className="alert alert-success mt-3">
               ✅ Checked In at: <b>{new Date(checkInTime).toLocaleTimeString()}</b>
            </div>
                  )}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card shadow border-0 p-4 text-center">
              <h5>Check-Out</h5>
              <button
                className="btn btn-danger mt-2"
                onClick={handleCheckOut}
              >
                Check Out
              </button>
              {checkOutTime && (
                <div className="alert alert-danger mt-3">
                  ❌ Checked Out at: <b>{new Date(checkOutTime).toLocaleTimeString()}</b>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 🔹 Working Hours */}
        {hours && (
          <div className="card shadow border-0 p-4 mt-3 text-center">
            <h5>Total Working Hours</h5>
            <h2 className="text-primary">{hours} hrs</h2>
          </div>
        )}

      </div>
    </div>
  );
}

export default EmployeePage;