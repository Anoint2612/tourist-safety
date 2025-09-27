require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

const mongo = new MongoClient(process.env.MONGO_URI);
let db;
(async () => {
  await mongo.connect();
  db = mongo.db(process.env.MONGO_DBNAME || "test");
  console.log("Connected to Mongo");
})();

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) return res.status(400).send("email + password required");

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      username: username || "",
      email,
      password: hashed,
      createdAt: new Date()
    });

    res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.listen(3000, () => console.log("Server listening on http://localhost:3000"));
