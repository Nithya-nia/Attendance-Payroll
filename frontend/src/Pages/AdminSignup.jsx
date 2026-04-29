import { useState } from "react";

function AdminSignup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container mt-5">
      <div className="card col-md-5 mx-auto shadow p-4">

        <h3 className="text-center mb-3">Admin Signup</h3>

        <input className="form-control mb-3" placeholder="Name" />
        <input className="form-control mb-3" placeholder="Email" />

        <div className="input-group mb-3">
          <input 
            type={showPassword ? "text" : "password"} 
            className="form-control" 
            placeholder="Password" 
          />
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </button>
        </div>

        <input className="form-control mb-3" placeholder="Company Name" />

        <button className="btn btn-dark w-100">Create Admin</button>

      </div>
    </div>
  );
}

export default AdminSignup;