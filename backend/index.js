const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");



const app = express();
app.use(cors());    
app.use(express.json());
const port = 5000;  

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://imnithyania_db_user:attendancepayroll@cluster0.hgwipps.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 
let userdb;
let Attendancedb;
let payrolldb;
const payrollCollection = client.db("PayrollDB").collection("Payroll");

async function run() {
  try {
    
    await client.connect();
    userdb = client.db("UserDB");
    Attendancedb = client.db("AttendanceDB");
    payrolldb = client.db("PayrollDB");
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.post("/employee-signup",async(req,res)=>{
    try{
        const{name,email,password,department}=req.body;
        const existing=await userdb.collection("users").findOne({email});
        if(existing){
            return
            res.json({message:"User already exists"})

        }
        await userdb.collection("users").insertOne({
      name,
      email,
      password,
      role: "employee",
      department,
      createdAt: new Date()
    });

    res.json({ message: "Employee data stored in MongoDB " });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/employee-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userdb.collection("users").findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

   
    if (user.password !== password) {
      return res.json({ message: "Invalid password" });
    }

    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret123",
      { expiresIn: "1000d" }
    );

    res.json({
      message: " User Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/check-in", async (req, res) => {
  try {
    const { userId, name } = req.body;

    // prevent multiple check-ins
    const existing = await Attendancedb.collection("Attendance").findOne({
      userId,
      checkOut: null
    });

    if (existing) {
      return res.json({ message: "Already checked in" });
    }

    const checkInTime = new Date();

    await Attendancedb.collection("Attendance").insertOne({
      userId,
      name,                // ✅ store name
      checkIn: checkInTime,
      checkOut: null,
      totalHours: 0,
      date: new Date().toDateString()
    });

    res.json({
      message: "Checked In",
      checkInTime
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
    
app.post("/check-out", async (req, res) => {
  try {
    const { userId } = req.body;

    const record = await Attendancedb.collection("Attendance").findOne({
      userId,
      checkOut: null
    });

    if (!record) {
      return res.json({ message: "No active check-in found" });
    }

    const checkOutTime = new Date();

    // ⏱️ calculate working hours
    const diff = checkOutTime - new Date(record.checkIn);
    const totalHours = (diff / (1000 * 60 * 60)).toFixed(2);

    await Attendancedb.collection("Attendance").updateOne(
      { _id: record._id },
      {
        $set: {
          checkOut: checkOutTime,
          totalHours
        }
      }
    );

    res.json({
      message: "Checked Out",
      checkOutTime,
      totalHours
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/attendance/today/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const today = new Date().toDateString();

    const record = await Attendancedb.collection("Attendance").findOne({
      userId,
      date: today
    });

    res.json(record || null);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/attendance/monthly/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await Attendancedb.collection("Attendance")
      .find({ userId })
      .toArray();

    let present = 0;
    let halfDay = 0;
    let absent = 0;

    records.forEach(r => {
      if (!r.totalHours) return;

      if (r.totalHours >= 8) present++;
      else if (r.totalHours >= 4) halfDay++;
      else absent++;
    });

    res.json({
      present,
      halfDay,
      absent,
      totalDays: records.length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ================== GENERATE PAYROLL ==================
app.post("/payroll/generate", async (req, res) => {
  try {
    let { userId, month, year } = req.body;

    // ✅ FIX: force types
    userId = String(userId);
    month = Number(month);
    year = Number(year);

    // ✅ prevent duplicate
    const existing = await payrollCollection.findOne({ userId, month, year });
    if (existing) {
      return res.json(existing);
    }

    const basicSalary = 30000;

    // ✅ get attendance
    const attendance = await Attendancedb.collection("Attendance")
      .find({ userId })
      .toArray();

    const totalDays = new Date(year, month, 0).getDate(); // dynamic days
    const presentDays = attendance.length;

    const perDay = basicSalary / totalDays;
    const lop = (totalDays - presentDays) * perDay;

    const overtime = 1000;
    const netPay = basicSalary - lop + overtime;

    const payroll = {
      userId,
      month,
      year,
      basicSalary,
      totalDays,
      presentDays,
      lop: Math.round(lop),
      overtime,
      netPay: Math.round(netPay),
      createdAt: new Date()
    };

    await payrollCollection.insertOne(payroll);

    console.log("Generated Payroll:", payroll);

    res.json(payroll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== GET PAYROLL ==================
app.get("/payroll/:userId", async (req, res) => {
  try {
    let { userId } = req.params;
    let { month, year } = req.query;

    // ✅ FIX: force types
    userId = String(userId);
    month = Number(month);
    year = Number(year);

    console.log("Searching:", { userId, month, year });

    const data = await payrollCollection.findOne({
      userId,
      month,
      year
    });

    console.log("Found:", data);

    res.json(data || { message: "Payroll not generated yet" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/admin-signup", async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    const existing = await userdb.collection("users").findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userdb.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "admin",   // ✅ IMPORTANT
      company,
      createdAt: new Date()
    });

    res.status(201).json({ message: "Admin created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userdb.collection("users").findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        company: user.company
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/employees", async (req, res) => {
  const data = await userdb.collection("users")
    .find({ role: "employee" })
    .toArray();
  res.json(data);
});

app.delete("/employee/:id", async (req, res) => {
  await userdb.collection("users")
    .deleteOne({ _id: new ObjectId(req.params.id) });

  res.json({ message: "Deleted" });
});

app.put("/employee/:id", async (req, res) => {
  await userdb.collection("users").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.json({ message: "Updated" });
});

app.listen(port, () => {
  console.log("Server is running on " ,port);
});
