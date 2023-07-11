const express = require("express");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.port || 5000;
const cors = require("cors");
// Middle ware
app.use(cors());
app.use(express.json());

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pr3l5ja.mongodb.net/?retryWrites=true&w=majority`;

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
    const serviceCollections = client
      .db("creative-agency")
      .collection("service");
    const ordersCollections = client.db("creative-agency").collection("order");
    const reviewsCollections = client
      .db("creative-agency")
      .collection("review");

    const usersCollections = client.db("creative-agency").collection("users");

    // Store Order
    app.post("/order", async (req, res) => {
      const data = req.body.order;
      const result = await ordersCollections.insertOne(data);
      res.send(result);
    });

    // Get Order
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const result = await ordersCollections.find(query).toArray();
      res.send(result);
    });

    // All-Order
    app.get("/all-order", async (req, res) => {
      const query = {};
      const result = await ordersCollections.find(query).toArray();
      res.send(result);
    });

    // update order status
    app.put("/order/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body.updateStatus;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: data,
        },
      };
      const result = await ordersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // user review
    app.post("/review", async (req, res) => {
      const review = req.body.userReview;
      const result = await reviewsCollections.insertOne(review);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const query = {};
      const result = await reviewsCollections.find(query).toArray();
      res.send(result);
    });

    // Store Users
    app.post("/user", async (req, res) => {
      const userData = req.body.userInfo;
      const email = userData.email;
      const query = { email: email };
      const token = jwt.sign({ email: email }, process.env.JWT_TOKEN);
      const checkUser = await usersCollections.findOne(query);
      if (checkUser === null) {
        const result = await usersCollections.insertOne(userData);
      }
      res.send({ token });
    });

    // Get Users
    app.get("/user", async (req, res) => {
      const query = {};
      const result = await usersCollections.find(query).toArray();
      res.send(result);
    });

    // Update User
    app.put("/user/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "Admin",
        },
      };
      const result = await usersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // get service
    app.get("/service", async (req, res) => {
      const query = {};
      const result = await serviceCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/service", async (req, res) => {
      const service = req.body.service;
      const result = await serviceCollections.insertOne(service);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("creative server is running:", port);
});
