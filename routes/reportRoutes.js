import express from "express";
import db from "../services/db.js";

const reportRoutes = express.Router();

// Reports page
reportRoutes.get("/reports", (req, res) => {
  res.render("reports");
});

// table route
reportRoutes.get("/table", (req, res) => {
  res.render("table");
});

// ====Get sale Report depending on To and From Date ====//
// ======================================================//

reportRoutes.get("/saleReport/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const saleReportQuery =
    "SELECT * FROM sales_data WHERE end_date BETWEEN $1 AND $2;";

  // Validate date parameters
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const saleReport = (await db.query(saleReportQuery, [to_date, from_date]))
      .rows;
    res.status(200).json(saleReport);
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// ====Get InProcess Report depending on To and From Date ====//
// ======================================================//

reportRoutes.get("/inprocessReport/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const inprocessReportQuery =
    "SELECT * FROM customer_in_process WHERE (sale_date BETWEEN $1 AND $2 OR followup_date BETWEEN $1 AND $2 ) AND process_status = true;";

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const inprocessReport = (
      await db.query(inprocessReportQuery, [to_date, from_date])
    ).rows;
    res.status(200).json(inprocessReport);
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// From sales table count Happy statust with date parameter;
reportRoutes.get("/statusCount/:type/:to_date/:from_date", async (req, res) => {
  const { type, to_date, from_date } = req.params;
  const statusCountQuery =
    "SELECT COUNT(current_status) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND current_status = $3;";

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const statusCountReport = await db.query(statusCountQuery, [
      to_date,
      from_date,
      type,
    ]);
    res.status(200).send({ Number: statusCountReport });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});
export default reportRoutes;
