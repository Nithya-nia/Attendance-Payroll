import { useEffect, useState } from "react";
import axios from "axios";

function EmployeePage() {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState("");
  const [showPayslip, setShowPayslip] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const today = await axios.get(`http://localhost:5000/attendance/today/${user._id}`);
      const monthData = await axios.get(`http://localhost:5000/attendance/monthly/${user._id}`);

      await axios.post(`http://localhost:5000/payroll/generate`, {
        userId: user._id,
        month,
        year
      });

      const pay = await axios.get(
        `http://localhost:5000/payroll/${user._id}?month=${month}&year=${year}`
      );

      setTodayAttendance(today.data);
      setMonthly(monthData.data);

      if (!pay.data || pay.data.message) {
        setPayroll(null);
        setError(pay.data?.message || "No payroll data");
      } else {
        setPayroll(pay.data);
        setError("");
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    }
  };

  const checkIn = async () => {
    await axios.post("http://localhost:5000/check-in", {
      userId: user._id,
      name: user.name
    });
    fetchAll();
  };

  const checkOut = async () => {
    await axios.post("http://localhost:5000/check-out", {
      userId: user._id
    });
    fetchAll();
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user.name}</h3>
          <p style={styles.email}>{user.email}</p>
          <div style={styles.dept}>{user.department}</div>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/employee-login";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2>Welcome, {user.name} 👋</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button style={styles.checkIn} onClick={checkIn}>✔ Check In</button>
          <button style={styles.checkOut} onClick={checkOut}>✖ Check Out</button>
        </div>

        {/* CARDS */}
        <div style={styles.grid}>

          {/* TODAY */}
          <div style={styles.card}>
            <h4>📅 Today</h4>
            <p><b>In:</b> {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : "-"}</p>
            <p><b>Out:</b> {todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString() : "-"}</p>
            <p><b>Hours:</b> {todayAttendance?.totalHours || 0}</p>
          </div>

          {/* MONTHLY */}
          <div style={styles.card}>
            <h4>📊 Monthly</h4>
            <p>Present: {monthly?.present || 0}</p>
            <p>Half Day: {monthly?.halfDay || 0}</p>
            <p>Absent: {monthly?.absent || 0}</p>
          </div>

          {/* PAYROLL */}
          <div style={styles.payrollCard}>
            <h4>💰 Payroll</h4>

            {payroll ? (
              <>
                <div style={styles.row}>
                  <span>Basic Salary</span>
                  <span>₹{payroll.basicSalary}</span>
                </div>

                <div style={styles.row}>
                  <span>Loss of Pay</span>
                  <span style={{ color: "red" }}>- ₹{payroll.lop}</span>
                </div>

                <div style={styles.row}>
                  <span>Overtime</span>
                  <span style={{ color: "green" }}>+ ₹{payroll.overtime}</span>
                </div>

                <hr />

                <div style={styles.netPay}>
                  ₹{payroll.netPay}
                </div>

                {/* VIEW PAYSLIP BUTTON */}
                <button
                  style={styles.payslipBtn}
                  onClick={() => setShowPayslip(!showPayslip)}
                >
                  {showPayslip ? "Hide Payslip" : "View Payslip"}
                </button>

                {/* INLINE PAYSLIP */}
                {showPayslip && (
                  <div style={styles.payslipBox}>
                    <h3 style={{ textAlign: "center" }}>Salary Slip</h3>
                    <hr />

                    <p><b>Name:</b> {user.name}</p>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>Department:</b> {user.department}</p>

                    <hr />

                    <div style={styles.row}>
                      <span>Basic Salary</span>
                      <span>₹{payroll.basicSalary}</span>
                    </div>

                    <div style={styles.row}>
                      <span>Loss of Pay</span>
                      <span style={{ color: "red" }}>- ₹{payroll.lop}</span>
                    </div>

                    <div style={styles.row}>
                      <span>Overtime</span>
                      <span style={{ color: "green" }}>+ ₹{payroll.overtime}</span>
                    </div>

                    <hr />

                    <h3 style={{ textAlign: "right" }}>
                      Net Pay: ₹{payroll.netPay}
                    </h3>
                  </div>
                )}

              </>
            ) : (
              <p>No payroll data</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Segoe UI" },

  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg,#4e73df,#1f3bb3)",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  profileBox: { textAlign: "center" },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "white",
    color: "#1f3bb3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 auto 10px"
  },

  email: { fontSize: "13px", opacity: 0.8 },

  dept: {
    marginTop: "10px",
    background: "#ffffff30",
    padding: "5px 10px",
    borderRadius: "10px",
    fontSize: "12px"
  },

  logout: {
    background: "white",
    color: "#1f3bb3",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  main: { flex: 1, padding: "25px", background: "#f4f6fb" },

  error: { color: "red", marginBottom: "10px" },

  actions: { display: "flex", gap: "10px", marginBottom: "20px" },

  checkIn: {
    background: "#4CAF50",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px"
  },

  checkOut: {
    background: "#e74c3c",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },

  payrollCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #4e73df"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },

  netPay: {
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "right"
  },

  payslipBtn: {
    marginTop: "10px",
    padding: "8px",
    background: "#4e73df",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  payslipBox: {
    marginTop: "15px",
    padding: "15px",
    background: "#f9fafc",
    borderRadius: "10px",
    border: "1px solid #ddd"
  },

  loading: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center"
  }
};

export default EmployeePage;