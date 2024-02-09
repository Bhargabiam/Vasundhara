import express from "express";
import db from "../services/db.js";

const tableRoutes = express.Router();

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
    const response = await db.query(registerquery, [
      username,
      email,
      password,
      role,
      date,
    ]);
    console.log(response);
  } catch (err) {
    console.error(err);
  }
});
export default tableRoutes;
