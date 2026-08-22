require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var connectDB = require("./config/db");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/authRoutes");

connectDB();

var app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/manager", require("./routes/managerRoutes"));


module.exports = app;
