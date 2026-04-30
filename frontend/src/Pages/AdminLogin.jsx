import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      return setError("Please enter email and password");
    }

    try {
      // ✅ use common login API
      const res = await axios.post("http://localhost:5000/admin-login", {
        email,
        password
      });

      const user = res.data.user;

      if (!user) {
        return setError("Invalid response from server");
      }

      // ✅ store user
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ role-based navigation
      if (user.role === "admin") {
        navigate("/admin-page");
      } else {
        navigate("/employee-page");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card col-md-5 mx-auto shadow p-4">

        <h3 className="text-center mb-3">Login</h3>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-success w-100"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="mt-3 text-center">
          <Link to="/admin-signup">
            Don't have an account? Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;