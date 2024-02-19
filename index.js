import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import "dotenv/config";
import router from "./routes/index.js";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./services/db.js";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Use the routes
app.use("/", router);
app.get("*", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/index/dashBoard");
  } else {
    res.redirect("/auth/login");
  }
});
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/index/dashBoard");
  } else {
    res.redirect("/auth/login");
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    const loginQuery =
      "SELECT * FROM user_list WHERE email = $1 AND user_status = true;";
    try {
      const result = await db.query(loginQuery, [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        //verifying the password
        bcrypt.compare(password, storedHashedPassword, (err, result) => {
          if (err) {
            return cb(err);
          } else {
            if (result) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("No Customer Found", false);
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
