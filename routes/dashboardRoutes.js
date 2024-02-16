import express from "express";
import db from "../services/db.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/dashBoard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index");
  } else {
    res.redirect("/auth/login");
  }
});

dashboardRoutes.get("/userProfile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("userProfile");
  } else {
    res.redirect("/auth/login");
  }
});

export default dashboardRoutes;

// From sales table count Happy statust with date parameter;
// reportRoutes.get("/statusCount/:type/:to_date/:from_date", async (req, res) => {
//   const { type, to_date, from_date } = req.params;
//   const statusCountQuery =
//     "SELECT COUNT(current_status) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND current_status = $3;";

//   const isValidDate = (dateString) => {
//     const regex = /^\d{4}-\d{2}-\d{2}$/;
//     return regex.test(dateString);
//   };

//   if (!isValidDate(to_date) || !isValidDate(from_date)) {
//     return res.status(400).json({ error: "Invalid date format" });
//   }

//   try {
//     const statusCountReport = (
//       await db.query(statusCountQuery, [to_date, from_date, type])
//     ).rows[0];
//     res.status(200).send({ count: statusCountReport.count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ err: "Internal Server Error" });
//   }
// });

// Count total number of inprocess query depend on dates

// reportRoutes.get("/inProcessCount/:to_date/:from_date", async (req, res) => {
//   const { to_date, from_date } = req.params;
//   const countInprocessQuery =
//     "SELECT COUNT(process_id) FROM customer_in_process WHERE followup_date BETWEEN $1 AND $2 AND process_status = true";

//   const isValidDate = (dateString) => {
//     const regex = /^\d{4}-\d{2}-\d{2}$/;
//     return regex.test(dateString);
//   };

//   if (!isValidDate(to_date) || !isValidDate(from_date)) {
//     return res.status(400).json({ error: "Invalid date format" });
//   }

//   try {
//     const countResult = (
//       await db.query(countInprocessQuery, [to_date, from_date])
//     ).rows[0];
//     res.status(200).send({ count: countResult.count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ err: "Internal Server Error" });
//   }
// });

// Count total number of inprocess query depend on dates

// reportRoutes.get("/saleCount/:to_date/:from_date", async (req, res) => {
//   const { to_date, from_date } = req.params;
//   const countSalesQuery =
//     "SELECT COUNT(sales_id) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND sales_status = true";

//   const isValidDate = (dateString) => {
//     const regex = /^\d{4}-\d{2}-\d{2}$/;
//     return regex.test(dateString);
//   };

//   if (!isValidDate(to_date) || !isValidDate(from_date)) {
//     return res.status(400).json({ error: "Invalid date format" });
//   }

//   try {
//     const countResult = (await db.query(countSalesQuery, [to_date, from_date]))
//       .rows[0];
//     res.status(200).send({ count: countResult.count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ err: "Internal Server Error" });
//   }
// });

// Product Wish count From Sales_data table depending on date and product_id;

// reportRoutes.get("/productCount/:id/:to_date/:from_date", async (req, res) => {
//   const { id, to_date, from_date } = req.params;
//   const productCountQuery =
//     "SELECT COUNT(sales_id) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND product_id = $3 AND sales_status = true";

//   const isValidDate = (dateString) => {
//     const regex = /^\d{4}-\d{2}-\d{2}$/;
//     return regex.test(dateString);
//   };

//   if (!isValidDate(to_date) || !isValidDate(from_date)) {
//     return res.status(400).json({ error: "Invalid date format" });
//   }

//   const isValidId = (iDString) => {
//     const regex = /^PROD_\d{6}_\d{4}$/;
//     return regex.test(iDString);
//   };

//   if (!isValidId(id)) {
//     return res.status(400).json({ error: "Invalid Product ID" });
//   }

//   try {
//     const countResult = (
//       await db.query(productCountQuery, [to_date, from_date, id])
//     ).rows[0];
//     res.status(200).send({ count: countResult.count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ err: "Internal Server Error" });
//   }
// });
