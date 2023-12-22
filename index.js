const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
require('dotenv').config()
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

// middleware
app.use(
    cors(
        {
            origin: ["http://localhost:5173", "https://booking-aeff8.web.app"],
            credentials: true,
          }
    )
);
app.use(express.json());
app.use(cookieParser());

const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
    res.send("Task management is running...");
  });
  app.listen(port, () => {
    console.log(`Task management app running is port ${port}`);
  });
