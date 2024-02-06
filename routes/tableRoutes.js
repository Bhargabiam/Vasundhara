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

export default tableRoutes;
