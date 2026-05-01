import { useEffect, useState } from "react";
import axios from "axios";

function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");

  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState(null);

  const [payroll, setPayroll] = useState(null);
  const [salaryStatus, setSalaryStatus] = useState("pending");

  useEffect(() => {
    const data = localStorage.getItem("user");

    if (data) {
      const parsed = JSON.parse(data);
      console.log("Admin Data:", parsed); 
      setAdmin(parsed);
    }

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/employees");
    setEmployees(res.data);
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`http://localhost:5000/employee/${id}`);
    fetchEmployees();
  };

  const updateEmployee = async (emp) => {
    const name = prompt("Enter name", emp.name);
    const dept = prompt("Enter department", emp.department);

    await axios.put(`http://localhost:5000/employee/${emp._id}`, {
      name,
      department: dept
    });

    fetchEmployees();
  };

  const viewAttendance = async (id) => {
    setActiveTab("attendance");

    const today = await axios.get(`http://localhost:5000/attendance/today/${id}`);
    const month = await axios.get(`http://localhost:5000/attendance/monthly/${id}`);

    setTodayAttendance(today.data);
    setMonthlyAttendance(month.data);
  };

  const viewPayroll = async (id) => {
    setActiveTab("payroll");

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    await axios.post("http://localhost:5000/payroll/generate", {
      userId: id,
      month,
      year
    });

    const res = await axios.get(
      `http://localhost:5000/payroll/${id}?month=${month}&year=${year}`
    );

    setPayroll(res.data); 
    setSalaryStatus("pending");
  };
const downloadPayslip = () => {
  console.log("Download clicked");

  const el = document.getElementById("payslip");

  if (!el) {
    alert("Payslip not found");
    return;
  }

  const newWin = window.open("", "_blank");

  newWin.document.write(`
    <html>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `);

  newWin.document.close();
  newWin.print();
};
  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>

          {admin ? (
            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                {admin.name?.charAt(0)?.toUpperCase()}
              </div>

              <h4>{admin.name}</h4>
              <p style={{ opacity: 0.8 }}>{admin.email}</p>

              <span style={styles.company}>
                {admin.company || "No Company"}
              </span>
            </div>
          ) : (
            <p>Loading admin...</p>
          )}

          <button
            style={activeTab === "employees" ? styles.activeBtn : styles.btn}
            onClick={() => setActiveTab("employees")}
          >
            Employees
          </button>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2>{activeTab.toUpperCase()}</h2>

        {/* EMPLOYEES */}
        {activeTab === "employees" && (
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.length > 0 ? (
                  employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>

                      <td>
                        <button style={styles.actionBtn} onClick={() => updateEmployee(emp)}>EDIT</button>
                        <button style={styles.deleteBtn} onClick={() => deleteEmployee(emp._id)}>DELETE</button>
                        <button style={styles.actionBtn} onClick={() => viewAttendance(emp._id)}>SALARY</button>
                        <button style={styles.actionBtn} onClick={() => viewPayroll(emp._id)}>PAYROLL</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      
        {activeTab === "attendance" && (
          <div style={styles.card}>
            <h4>Today</h4>
            <p>Check In: {todayAttendance?.checkIn || "-"}</p>
            <p>Check Out: {todayAttendance?.checkOut || "-"}</p>

            <h4 style={{ marginTop: 20 }}>Monthly</h4>
            <p>Present: {monthlyAttendance?.present || 0}</p>
            <p>Absent: {monthlyAttendance?.absent || 0}</p>
          </div>
        )}

      
        {activeTab === "payroll" && payroll && (
          <div style={styles.card} id="payslip">
            <h3>Payslip</h3>

            <p>Basic: ₹{payroll.basicSalary}</p>
            <p style={{ color: "red" }}>LOP: ₹{payroll.lop}</p>
            <p style={{ color: "green" }}>OT: ₹{payroll.overtime}</p>

            <h2>₹{payroll.netPay}</h2>

            <p>Status: <b>{salaryStatus}</b></p>

            <button style={styles.approve} onClick={() => setSalaryStatus("approved")}>
              Approve
            </button>

            <button style={styles.hold} onClick={() => setSalaryStatus("hold")}>
              Hold
            </button>
             <button style={styles.download} onClick={downloadPayslip}>
                  Download Payslip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", fontFamily: "Segoe UI" },

  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg,#4e73df,#1f3bb3)",
    color: "white",
    padding: "20px",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  profileCard: {
    textAlign: "center",
    marginBottom: "20px"
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "white",
    color: "#1f3bb3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    margin: "auto",
    marginBottom: "10px",
    fontWeight: "bold"
  },

  company: {
    background: "#ffffff30",
    padding: "5px 10px",
    borderRadius: "10px",
    fontSize: "12px"
  },

  btn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "white",
    border: "none",
    cursor: "pointer"
  },

  activeBtn: {
    width: "100%",
    padding: "10px",
    background: "#ffffff30",
    color: "white",
    border: "none"
  },

  logout: {
    background: "white",
    color: "#1f3bb3",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "30px",
    background: "#f4f6fb"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },

  actionBtn: {
    margin: "3px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#4e73df",
    color: "white",
    cursor: "pointer"
  },

  deleteBtn: {
    margin: "3px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#e74a3b",
    color: "white",
    cursor: "pointer"
  },

  approve: {
    background: "green",
    color: "white",
    padding: "8px",
    marginRight: "10px",
    border: "none",
    borderRadius: "6px"
  },

  hold: {
    background: "orange",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "6px"
  },
    download: {
    background: "blue",
    color: "white",
    padding: "6px",
    marginLeft: "10px",
    border: "none",
    borderRadius: "6px"
  }
};

export default AdminPage;