const express = require('express');
const cors = require('cors');

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

async function run() {
  try {
    
    await client.connect();
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on " ,port);
});
