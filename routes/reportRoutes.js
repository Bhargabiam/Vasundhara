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

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
// ===========================FOR DASHBORD DATAs=====================================//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

// Count Total Customer in DataBase
reportRoutes.get("/totalClient", async (req, res) => {
  const totalClientQuery = "SELECT COUNT(customer_id) FROM customer_details;";
  try {
    const totalClient = (await db.query(totalClientQuery)).rows[0].count;
    if (totalClient == 0) {
      res.status(404).send({ err: "No Data Found For Clint Count" });
    } else {
      res.status(200).send(totalClient);
    }
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Count Total Active Inprocess
reportRoutes.get("/totalActiveQuery", async (req, res) => {
  const totalActiveQuery =
    "SELECT COUNT(process_id) FROM customer_in_process WHERE process_status = true;";
  try {
    const activeQuery = (await db.query(totalActiveQuery)).rows[0].count;
    if (activeQuery == 0) {
      res.status(404).send({ err: "No Data Found For Active Query" });
    } else {
      res.status(200).send(activeQuery);
    }
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Count Total Close Inprocess Between TWo Dates
reportRoutes.get("/totalCloseQuery/:to/:from", async (req, res) => {
  const { to, from } = req.params;
  const totalcloseQuery =
    "SELECT COUNT(process_id) FROM customer_in_process WHERE process_status = false AND folloWup_date BETWEEN $1 AND $2;";
  try {
    const closeQuery = (await db.query(totalcloseQuery, [to, from])).rows[0]
      .count;
    if (closeQuery == 0) {
      res.status(404).send({ err: "No Data Found For close Query" });
    } else {
      res.status(200).send(closeQuery);
    }
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// Count Total Sale Between TWo Dates
reportRoutes.get("/totalSale/:to/:from", async (req, res) => {
  const { to, from } = req.params;
  const totalSaleQuery =
    "SELECT COUNT(sales_id) FROM sales_data WHERE sales_status = true AND end_date BETWEEN $1 AND $2;";
  try {
    const saleCount = (await db.query(totalSaleQuery, [to, from])).rows[0]
      .count;
    if (saleCount == 0) {
      res.status(404).send({ err: "No Data Found For close Query" });
    } else {
      res.status(200).send(saleCount);
    }
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// get Status count from sales Table
reportRoutes.get("/statusCount/:to/:from", async (req, res) => {
  const { to, from } = req.params;
  const statusCountQuery = `SELECT COUNT(*) FILTER (WHERE current_status = 'Happy') AS "Happy",COUNT(*) FILTER (WHERE current_status = 'UnHappy') AS "UnHappy",COUNT(*) FILTER (WHERE current_status = 'Service/Repair') AS "Service",COUNT(*) FILTER (WHERE current_status = 'order') AS "Casual" FROM sales_data WHERE sales_status = true AND end_date BETWEEN $1 AND $2;`;
  try {
    const statusCount = (await db.query(statusCountQuery, [to, from])).rows[0];
    res.status(200).send(statusCount);
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

// get sales id count group by each day from sales data

reportRoutes.get("/salesCount/:to/:from", async (req, res) => {
  const { to, from } = req.params;
  const salesCountQuery = `SELECT To_CHAR((end_date), 'YYYY-MM-DD') AS day, COUNT(sales_id) AS count FROM sales_data WHERE sales_status = true AND end_date BETWEEN $1 AND $2 GROUP BY DATE(end_date) ORDER BY DATE(end_date);`;

  try {
    const salesCount = (await db.query(salesCountQuery, [to, from])).rows;
    res.status(200).send(salesCount);
  } catch (err) {
    res.status(500).send({ err: "Internal Server Error" });
  }
});

export default reportRoutes;
