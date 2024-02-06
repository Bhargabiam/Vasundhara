import express from "express";
import db from "../services/db.js";

const reportRoutes = express.Router();

// Reports page
reportRoutes.get("/reports", (req, res) => {
  res.render("getReports");
});

// table route
reportRoutes.get("/table", (req, res) => {
  res.render("table");
});

// ====Get sale Report depending on To and From Date ====//
// ======================================================//

reportRoutes.get("/saleReport/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const saleReportQuery = `SELECT cd.customer_name as "Name",sd.bill_number as "Bill Number",sd.second_mob as "Bill Mobile",sd.customer_type as "Type",sd.metal_type as "Metal",sd.walkin_source as "Source",cl.executive_name as "Executive",al.executive_name as "Associate",pl.product_name as "Product",sd.fm_name as "Manager",sd.current_status as "Status",sd.non_conversion as "Reason",sd.remarks as "Remarks", To_CHAR(DATE(sd.sale_date), 'YYYY-MM-DD') as "Start Date", sd.visit_dates as "Visit Dates", To_CHAR(DATE(sd.end_date), 'YYYY-MM-DD') as "End Date" FROM sales_data sd JOIN customer_details cd ON sd.customer_id = cd.customer_id JOIN executive_list cl ON sd.executive_id = cl.executive_id JOIN executive_list al ON sd.associate_id = al.executive_id JOIN product_list pl ON sd.product_id = pl.product_id WHERE sd.end_date BETWEEN $1 AND $2 AND sd.sales_status = true;`;

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
  const inprocessReportQuery = `SELECT cd.customer_name as "Name",cd.customer_mobile as "Mobile",cp.second_mob as "Sec Mobile",cp.customer_type as "Type",cp.metal_type as "Metal",cp.walkin_source as "Source",cl.executive_name as "Executive",al.executive_name as "Associate",pl.product_name as "Product",cp.fm_name as "Manager",cp.current_status as "Status",cp.non_conversion as "Reason",cp.remarks as "Remarks",TO_CHAR(DATE(cp.sale_date), 'YYYY-MM-DD') as "Start Date",cp.visit_dates as "Visit Dates", To_CHAR(DATE(cp.followup_date), 'YYYY-MM-DD') as "Next Date" FROM customer_in_process cp JOIN customer_details cd ON cp.customer_id = cd.customer_id JOIN executive_list cl ON cp.executive_id = cl.executive_id JOIN executive_list al ON cp.associate_id = al.executive_id JOIN product_list pl ON cp.product_id = pl.product_id WHERE cp.process_status = true AND (cp.sale_date BETWEEN $1 AND $2 OR cp.followup_date BETWEEN $1 AND $2);`;

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

// ====Get Full Report (Sale and Inprocess Combine) depending on To and From Date ====//
// ======================================================//

reportRoutes.get("/fullReport/:to_date/:from_date", async (req, res) => {
  const { to_date, from_date } = req.params;
  const fullReportQuery = `SELECT NULL AS "Last Status",cd.customer_name AS "Name",cd.customer_mobile AS "Mobile",sd.bill_number AS "Bill Id",sd.second_mob AS "Bill Mob",sd.metal_type AS "Metal",el.executive_name AS "Executive",ael.executive_name AS "Associate",pl.product_name AS "Product",sd.current_status AS "Status",sd.non_conversion AS "Resoin",sd.remarks AS "Remarks",TO_CHAR(DATE(sd.sale_date), 'YYYY-MM-DD') AS "Start",NULL AS "Next followup",TO_CHAR(DATE(sd.end_date), 'YYYY-MM-DD') AS "End",sd.visit_dates AS "Visits" FROM public.sales_data sd JOIN public.customer_details cd ON sd.customer_id = cd.customer_id JOIN public.executive_list el ON sd.executive_id = el.executive_id JOIN public.executive_list ael ON sd.associate_id = ael.executive_id JOIN public.product_list pl ON sd.product_id = pl.product_id WHERE sd.sales_status = true AND sd.end_date BETWEEN $1 AND $2 UNION ALL SELECT cip.process_status,cd.customer_name AS "Name",cd.customer_mobile AS "Mobile",NULL AS bill_number,cip.second_mob AS "Bill Mob",cip.metal_type AS "Metal",el.executive_name AS "Executive",ael.executive_name AS "Associate",pl.product_name AS "Product",cip.current_status AS "Status",cip.non_conversion AS "Reson",cip.remarks AS "Remark",TO_CHAR(DATE(cip.sale_date), 'YYYY-MM-DD') AS "Start",TO_CHAR(DATE(cip.followup_date), 'YYYY-MM-DD') as "Next followup",NULL AS end_date,cip.visit_dates AS "Visit" FROM public.customer_in_process cip JOIN public.customer_details cd ON cip.customer_id = cd.customer_id JOIN public.executive_list el ON cip.executive_id = el.executive_id JOIN public.executive_list ael ON cip.associate_id = ael.executive_id JOIN public.product_list pl ON cip.product_id = pl.product_id WHERE cip.sale_date BETWEEN $1 AND $2 AND cip.followup_date BETWEEN $1 AND $2 AND cip.process_status = true ORDER BY "Start";`;

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  if (!isValidDate(to_date) || !isValidDate(from_date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const fullReport = (await db.query(fullReportQuery, [to_date, from_date]))
      .rows;
    res.status(200).json(fullReport);
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
    const productCountQuery = `SELECT cd.customer_name AS "Name",cd.customer_mobile AS "Mobile",sd.bill_number AS "Bill No",sd.second_mob AS "Bill/2nd Mob",sd.customer_type AS "Type",sd.walkin_source AS "Walk In",el.executive_name AS "Executive",al.executive_name AS "Associate",pl.product_name AS "Product",sd.fm_name AS "Maneger",sd.current_status AS "Status",sd.non_conversion AS "Reason",sd.remarks AS "Remark",To_CHAR((sd.sale_date),'YYYY-MM-DD') AS "Start",sd.visit_dates AS "Visit Dates",To_CHAR((sd.end_date), 'YYYY-MM-DD') AS "End" FROM sales_data sd JOIN customer_details cd ON cd.customer_id = sd.customer_id JOIN executive_list el ON el.executive_id = sd.executive_id JOIN executive_list al ON al.executive_id = sd.associate_id JOIN product_list pl ON pl.product_id = sd.product_id WHERE sd.end_date BETWEEN $1 AND $2 AND sd.sales_status = true AND (sd.executive_id = $3 OR sd.associate_id = $3)`;

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

// Executive Wish From Sales_data and customer_in_process table depending on date and executive_id;

reportRoutes.get(
  "/executiveFullReport/:id/:to_date/:from_date",
  async (req, res) => {
    const { id, to_date, from_date } = req.params;
    const executiveFullQuery = `SELECT NULL AS "Last Status",cd.customer_name AS "Name",cd.customer_mobile AS "Mobile",sd.bill_number AS "Bill No",sd.second_mob AS "Bill/2nd Mob",sd.customer_type AS "Type",sd.walkin_source AS "Walk In",el.executive_name AS "Executive",al.executive_name AS "Associate",pl.product_name AS "Product",sd.fm_name AS "Maneger",sd.current_status AS "Status",sd.non_conversion AS "Reason",sd.remarks AS "Remark",To_CHAR((sd.sale_date), 'YYYY-MM-DD') AS "Start",sd.visit_dates AS "Visit Dates",To_CHAR((sd.end_date), 'YYYY-MM-DD') AS "End",NULL AS "Follow Up" FROM sales_data sd JOIN customer_details cd ON cd.customer_id = sd.customer_id JOIN executive_list el ON el.executive_id = sd.executive_id JOIN executive_list al ON al.executive_id = sd.associate_id JOIN product_list pl ON pl.product_id = sd.product_id WHERE sd.end_date BETWEEN $1 AND $2 AND sd.sales_status = true AND (sd.executive_id = $3 OR sd.associate_id = $3) UNION ALL SELECT cp.process_status AS "Last Status",cd.customer_name AS "Name",cd.customer_mobile AS "Mobile",NULL AS "Bill No",cp.second_mob AS "Bill/2nd Mob",cp.customer_type AS "Type",cp.walkin_source AS "Walk In",el.executive_name AS "Executive",al.executive_name AS "Associate",pl.product_name AS "Product",cp.fm_name AS "Maneger",cp.current_status AS "Status",cp.non_conversion AS "Reason",cp.remarks AS "Remark",To_CHAR((cp.sale_date), 'YYYY-MM-DD') AS "Start",cp.visit_dates AS "Visit Dates", NULL AS "End",To_CHAR((cp.followup_date), 'YYYY-MM-DD') AS "Follow Up" FROM customer_in_process cp JOIN customer_details cd ON cd.customer_id = cp.customer_id JOIN executive_list el ON el.executive_id = cp.executive_id JOIN executive_list al ON al.executive_id = cp.associate_id JOIN product_list pl ON pl.product_id = cp.product_id WHERE (cp.sale_date BETWEEN $1 AND $2 OR cp.followup_date BETWEEN $1 AND $2) AND cp.process_status = true AND (cp.executive_id = $3 OR cp.associate_id = $3) ORDER BY "Start";`;

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
      const executiveFullResult = (
        await db.query(executiveFullQuery, [to_date, from_date, id])
      ).rows;
      res.status(200).send(executiveFullResult);
    } catch (err) {
      console.error(err);
      res.status(500).send({ err: "Internal Server Error" });
    }
  }
);

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

export default reportRoutes;
