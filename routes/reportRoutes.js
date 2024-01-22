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
    const statusCountReport = (
      await db.query(statusCountQuery, [to_date, from_date, type])
    ).rows[0];
    res.status(200).send({ count: statusCountReport.count });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Count total number of inprocess query depend on dates

reportRoutes.get("/inProcessCount/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const countInprocessQuery =
    "SELECT COUNT(process_id) FROM customer_in_process WHERE followup_date BETWEEN $1 AND $2 AND process_status = true";

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const countResult = (
      await db.query(countInprocessQuery, [to_date, from_date])
    ).rows[0];
    res.status(200).send({ count: countResult.count });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Count total number of inprocess query depend on dates

reportRoutes.get("/saleCount/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const countSalesQuery =
    "SELECT COUNT(sales_id) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND sales_status = true";

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const countResult = (await db.query(countSalesQuery, [to_date, from_date]))
      .rows[0];
    res.status(200).send({ count: countResult.count });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Product Wish count From Sales_data table depending on date and product_id;

reportRoutes.get("/productCount/:id/:to_date/:from_date", async (req, res) => {
  const { id, to_date, from_date } = req.params;
  const productCountQuery =
    "SELECT COUNT(sales_id) FROM sales_data WHERE end_date BETWEEN $1 AND $2 AND product_id = $3 AND sales_status = true";

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const isValidId = (iDString) => {
    const regex = /^PROD_\d{6}_\d{4}$/;
    return regex.test(iDString);
  };

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid Product ID" });
  }

  try {
    const countResult = (
      await db.query(productCountQuery, [to_date, from_date, id])
    ).rows[0];
    res.status(200).send({ count: countResult.count });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Executive Wish From Sales_data table depending on date and executive_id;

reportRoutes.get(
  "/executiveReport/:id/:to_date/:from_date",
  async (req, res) => {
    const { id, to_date, from_date } = req.params;
    const productCountQuery =
      "SELECT sd.*, cd.customer_name, cd.customer_mobile, el.executive_name AS executive_name, al.executive_name AS associate_name, pl.product_name FROM sales_data sd JOIN customer_details cd ON cd.customer_id = sd.customer_id JOIN executive_list el ON el.executive_id = sd.executive_id JOIN executive_list al ON al.executive_id = sd.associate_id JOIN product_list pl ON pl.product_id = sd.product_id WHERE sd.end_date BETWEEN $1 AND $2 AND sd.executive_id = $3 AND sd.sales_status = true;";

    const isValidDate = (dateString) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateString);
    };

    if (!isValidDate(to_date) || !isValidDate(from_date)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const isValidId = (iDString) => {
      const regex = /^EXUT_\d{6}_\d{4}$/;
      return regex.test(iDString);
    };

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid Executive ID" });
    }

    try {
      const executiveResult = (
        await db.query(productCountQuery, [to_date, from_date, id])
      ).rows;
      res.status(200).send(executiveResult);
    } catch (err) {
      console.error(err);
      res.status(500).send({ err: "Internal Server Error" });
    }
  }
);
export default reportRoutes;
