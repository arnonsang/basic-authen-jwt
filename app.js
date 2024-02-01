const express = require("express");
const app = express();

const dotenv = require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const port = process.env.PORT || 3002;

const auth = require("./middleware/middleware");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./db/db");
const {
  getUsers,
  getUserById,
  createUser,
  signIn,
  tokenIsValid,
} = require("./controller/user.controller");

/**
 * !IMPORTANT - CORS
 * TODO: Add CORS to allow only specific domains e.g. localhost:3000
 */

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.status(200).send("Hello World!"));
app.get("/api/users", auth, getUsers);
app.get("/api/user/:id", auth, getUserById);
app.post("/api/register", createUser);
app.post("/api/login", signIn);
app.get("/api/token", auth);

app.listen(port, () =>
  console.log(`API listening on port http://localhost:${port}!`)
);
