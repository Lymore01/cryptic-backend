require("dotenv").config();
require("./database/config/index");
const express = require("express");
const session = require("express-session");
const store = require("./database/SessionStorage/sessions");
const PORT = process.env.PORT;
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/users/usersRoute");
const keysRoute = require("./routes/keys/createKeys");

const app = express();

;


app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1200000, //20 mins
    },
  })
);

//   middlewares

app.use(cors({
  origin:"https://crypticos.netlify.app",
}));

app.use(bodyParser.json())

app.use("/api", userRoute);
app.use("/key", keysRoute);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(PORT, () => {
  console.log("Listening on port 3000");
});

module.exports = app;
