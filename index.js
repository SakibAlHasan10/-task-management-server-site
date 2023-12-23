const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://booking-aeff8.web.app"],
    credentials: true,
  })
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
  },
});
// create middleware for token
const secretRouter = async (req, res, next) => {
  // console.log(req.cookies?.token)
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.SECRET_TK, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};
async function run() {
  const usersCollection = client.db(process.env.SECRET_DB).collection("users");
  const taskCollection = client.db(process.env.SECRET_DB).collection("tasks");
  //   create jwt token
  app.post("/jwt", async (req, res) => {
    try {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KE, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    } catch (error) {
      res.send(error);
    }
  });
  // logout
  app.post("/logout", async (req, res) => {
    const user = req.body;
    res.clearCookie("token", {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
  });
  app.get("/task", async (req, res) => {
    try {
      const email = req.query;
      console.log(email, "gggg");
      const result = await taskCollection.find(email).toArray();
      console.log(result);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   post task
  app.post("/task", async (req, res) => {
    try {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  app.delete("/task/:id", async (req, res) => {
    // /task/${id}
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //  users
  app.post("/users", async (req, res) => {
    try {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //   try {
  //     // Connect the client to the server	(optional starting in v4.7)
  //     await client.connect();
  //     // Send a ping to confirm a successful connection
  //     await client.db("admin").command({ ping: 1 });
  //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
  //   } finally {
  //     // Ensures that the client will close when you finish/error
  //     await client.close();
  //   }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Task management is running...");
});
app.listen(port, () => {
  console.log(`Task management app running is port ${port}`);
});
