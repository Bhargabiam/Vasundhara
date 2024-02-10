import express from "express";
import db from "../services/db.js";
import bcrypt from "bcrypt";

const tableRoutes = express.Router();
const saltRounds = 12;

// tableRoutes.get("/saleReport", (req, res) => {
//   const data = req.query.data;
//   res.render("saleTable", { data });
// });

tableRoutes.post("/saleReport", (req, res) => {
  const data = req.body.data;
  res.render("saleTable", { data });
});

tableRoutes.get("/login", (req, res) => {
  res.render("login");
});

tableRoutes.get("/register", (req, res) => {
  res.render("register");
});

tableRoutes.post("/register", async (req, res) => {
  const { username, email, role, password } = req.body;
  let date = new Date();
  const registerquery =
    "INSERT INTO user_list (user_name, email, password, roll, create_date) VALUES ($1,$2,$3,$4,$5);";

  try {
    const checkResult = await db.query(
      "SELECT * FROM user_list WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      res.status(409).send("Email already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          res.status(500).send("Error hashing password:", err);
        } else {
          await db.query(registerquery, [username, email, hash, role, date]);
          res.status(201).render("index.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

tableRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const loginQuery = "SELECT * FROM user_list WHERE email = $1";

  try {
    const result = await db.query(loginQuery, [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      //verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            res.render("index.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});
export default tableRoutes;
