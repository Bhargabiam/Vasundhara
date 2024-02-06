import express from "express";
import db from "../services/db.js";

const salesRoutes = express.Router();

// ====rander sale Form page====//
// =============================//

salesRoutes.get("/addSaleDetails", (req, res) => {
  res.render("salesDetails");
});

// ====add sale Data====//
// =====================//
salesRoutes.post("/saleData/:customer_id", async (req, res) => {
  const {
    sec_mobile,
    customer_type,
    metal_type,
    walkin_source,
    executive_name,
    associate_name,
    product_name,
    fm_name,
    current_status,
    non_conversion,
    remarks,
    sale_date,
    bill_number,
  } = req.body;
  const customer_id = req.params.customer_id;
  try {
    const addToInprocessQuery =
      "INSERT INTO sales_data (customer_id, second_mob, customer_type, metal_type, walkin_source, executive_id, associate_id, product_id, fm_name, current_status, non_conversion, remarks, sale_date, visit_dates, end_date, bill_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);";
    await db.query(addToInprocessQuery, [
      customer_id,
      sec_mobile,
      customer_type,
      metal_type,
      walkin_source,
      executive_name,
      associate_name,
      product_name,
      fm_name,
      current_status,
      non_conversion,
      remarks,
      sale_date,
      sale_date,
      sale_date,
      bill_number,
    ]);
    res.status(200).send("Successfully Submited");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error: Unable to process the request");
  }
});

// ===inprocess data sabmit into sale data in sales_data table====//
// =============================//

salesRoutes.post("/processToSale/:processId", async (req, res) => {
  const processId = req.params.processId;
  const {
    sec_mobile,
    metal_type,
    executive_name,
    associate_name,
    product_name,
    fm_name,
    current_status,
    non_conversion,
    remarks,
    sale_date,
    follwup_date,
    bill_number,
  } = req.body;
  let visitDates = `${sale_date} - Prev. Visit date- `;
  let customerId = "";
  let customerType = "";
  let walkinSource = "";
  let saleDate = "";
  const getInprocessDataQuery =
    "SELECT customer_id, customer_type, walkin_source, sale_date, visit_dates FROM customer_in_process WHERE process_id = $1";
  const addSaleDataQuery =
    "INSERT INTO sales_data (customer_id, second_mob, customer_type, metal_type, walkin_source, executive_id, associate_id, product_id, fm_name, current_status, non_conversion, remarks, sale_date, visit_dates, end_date, bill_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);";
  try {
    const inprocessData = (await db.query(getInprocessDataQuery, [processId]))
      .rows[0];
    customerId = inprocessData.customer_id;
    customerType = inprocessData.customer_type;
    walkinSource = inprocessData.walkin_source;
    visitDates += inprocessData.visit_dates;
    saleDate = inprocessData.sale_date;

    await db.query(addSaleDataQuery, [
      customerId,
      sec_mobile,
      customerType,
      metal_type,
      walkinSource,
      executive_name,
      associate_name,
      product_name,
      fm_name,
      current_status,
      non_conversion,
      remarks,
      saleDate,
      visitDates,
      sale_date,
      bill_number,
    ]);
    res.status(200).send({ message: "Data Submitted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default salesRoutes;
