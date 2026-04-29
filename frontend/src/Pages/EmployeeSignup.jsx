import { useState } from "react";

function EmployeeSignup() {
  const [salary, setSalary] = useState("");

  return (
    <div className="container mt-5">
      <div className="card col-md-5 mx-auto shadow p-4">

        <h3 className="text-center mb-3">Employee Signup</h3>

        <input className="form-control mb-3" placeholder="Name" />
        <input className="form-control mb-3" placeholder="Email" />
        <input className="form-control mb-3" placeholder="Department" />

       
       

        <button className="btn btn-primary w-100">Create Employee</button>
        

      </div>
    </div>
  );
}

export default EmployeeSignup;