import express from "express";
import db from "../services/db.js";
import bcrypt, { hash } from "bcrypt";
import passport from "passport";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const authRoutes = express.Router();
const saltRounds = 12;

authRoutes.get("/login", (req, res) => {
  res.render("login");
});

authRoutes.get("/register", (req, res) => {
  res.render("register");
});

authRoutes.post("/register", async (req, res) => {
  const { name, username, role, password } = req.body;
  let date = new Date();
  const registerquery =
    "INSERT INTO user_list (user_name, email, password, roll, create_date) VALUES ($1,$2,$3,$4,$5) RETURNING *;";

  try {
    const checkResult = await db.query(
      "SELECT * FROM user_list WHERE email = $1",
      [username]
    );

    if (checkResult.rows.length > 0) {
      res.status(409).send("Email already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          res.status(500).send("Error hashing password:", err);
        } else {
          const result = await db.query(registerquery, [
            name,
            username,
            hash,
            role,
            date,
          ]);
          //   res.status(201).render("index.ejs");
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log(err);
            res.status(200).send(user);
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// {successRedirect: "/index/dashBoard",failureRedirect: "/login",}
authRoutes.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureMessage: true,
  }),
  (req, res) => {
    res.status(200).send(req.user);
  }
);

authRoutes.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

authRoutes.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).send(req.user);
  }
});

authRoutes.post("/changePassword", isAuthenticated, async (req, res) => {
  const { userID, newPassword } = req.body;
  const passwordquery =
    "UPDATE user_list SET password = $1 WHERE user_id = $2;";
  try {
    bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
      if (err) {
        res.status(500).send("Error hashing password:", err);
      } else {
        await db.query(passwordquery, [hash, userID]);
        res.status(200).json("password successfully changed");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

export default authRoutes;
