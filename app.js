//essential packages
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

const app = express();
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/author");
const bookRouter = require("./routes/books");
const bodyParser = require("body-parser");

//dependencies
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
//to use header and footer once for all files
app.set("layout", "layouts/layout");
app.use(expressLayouts);
//this bodyparser is for parsing data from url
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
//files for js css
app.use(express.static("public"));

//database connection
mongoose.connect(
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false/lib",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.on("error", (error) => {
  console.error(error);
});
db.once("open", () => console.log("Connected to mongoose"));

//this is a port for running server
const port = process.env.PORT || 5000;

app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

app.listen(port, () => {
  console.log(`server is running on localhost:${port}`);
});
