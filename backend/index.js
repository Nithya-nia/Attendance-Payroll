const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");



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

async function run() {
  try {
    
    await client.connect();
    userdb = client.db("UserDB");
    Attendancedb = client.db("AttendanceDB");
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

app.post("/login", async (req, res) => {
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

app.listen(port, () => {
  console.log("Server is running on " ,port);
});
