const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqk54.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const classCollection = client.db("toyshop").collection("class");
    const enrollCollection = client.db("toyshop").collection("enroll");
    const userCollection = client.db("toyshop").collection("user");
    const paymentCollection = client.db("toyshop").collection("payment");

    // class cruds
    // get all classes
    app.get("/classes", async (req, res) => {
      const cursor = classCollection.find();
      const result = await cursor.toArray();
      return res.send(result);
    });
    app.get("/classes-popular", async (req, res) => {
      const cursor = classCollection
        .find({ status: "approved" })
        .sort({ totalEnrolledStudents: -1 })
        .limit(6);

      const result = await cursor.toArray();
      return res.send(result);
    });
    // get class by instructors email
    app.get("/classes/:id", async (req, res) => {
      const email = req.params.id;
      const cursor = classCollection.find({ instructorEmail: email });
      const result = await cursor.toArray();
      return res.send(result);
    });

    app.get("/approved-class", async (req, res) => {
      console.log("first");
      const cursor = classCollection.find({ status: "approved" });
      const result = await cursor.toArray();
      console.log(result);
      return res.send(result);
    });

    // app.get("/alltoy", async (req, res) => {
    //   const cursor = classCollection.find().limit(20);
    //   const result = await cursor.toArray();
    //   return res.send(result);
    // });

    app.post("/create-class", async (req, res) => {
      const toy = req.body;
      const result = await classCollection.insertOne(toy);
      res.send(result);
    });

    // get single classes
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await classCollection.findOne(query);
      res.send(result);
    });

    app.patch("/class/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const data = req.body;

      const updateDoc = {
        $set: data,
      };
      console.log(updateDoc);
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/class-seat/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await classCollection.updateOne(filter, {
        $inc: { availableSeats: -1, totalEnrolledStudents: 1 },
      });
      res.send(result);
    });
    // delete class
    app.delete("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classCollection.deleteOne(query);
      res.send(result);
    });

    // get all user
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      return res.send(result);
    });
    // get all Instractors
    app.get("/users-instractors", async (req, res) => {
      const cursor = userCollection.find({ role: "instructor" });
      const result = await cursor.toArray();
      return res.send(result);
    });

    // get single user
    app.get("/user/:id", async (req, res) => {
      const email = req.params.id;
      const result = await userCollection.findOne({ email: email });
      res.send(result);
    });
    // create user
    app.post("/create-user", async (req, res) => {
      const toy = req.body;
      const result = await userCollection.insertOne(toy);
      res.send(result);
    });
    // edit user
    app.patch("/user/:id", async (req, res) => {
      const email = req.params.id;
      const filter = { email: email };
      const data = req.body;

      const updateDoc = {
        $set: data,
      };
      console.log(updateDoc);
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // enrolled class
    app.post("/create-enroll", async (req, res) => {
      const toy = req.body;
      const result = await enrollCollection.insertOne(toy);
      res.send(result);
    });

    app.post("/payment-history", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    });

    app.get("/payment-history/:id", async (req, res) => {
      const email = req.params.id;
      const cursor = paymentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/my-enroll/:id", async (req, res) => {
      console.log(req.body);
      const cursor = enrollCollection.find({
        studentEmail: req.params.id,
        enrollStatus: "pending",
      });
      const result = await cursor.toArray();
      return res.send(result);
    });
    app.get("/my-success-enroll/:id", async (req, res) => {
      console.log(req.body);
      const cursor = enrollCollection.find({
        studentEmail: req.params.id,
        enrollStatus: "success",
      });
      const result = await cursor.toArray();
      return res.send(result);
    });

    app.patch("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const data = req.body;
      const updateDoc = {
        $set: data,
      };
      console.log(updateDoc);
      const result = await enrollCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await enrollCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB database!");
  } finally {
    // Ensures that the client will close when you finish/errors
    // await client.close();wsdf
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//
