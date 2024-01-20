import express from "express";
import db from "../services/db.js";

const inProcessRoutes = express.Router();

// ====render update Inprocess data page====//
//==========================================//

inProcessRoutes.get("/updateInprocessData", (req, res) => {
  res.render("inprocessDetails");
});

// ====get a Inprocess data uing inprocess id====//
// ==============================================//

inProcessRoutes.get("/inprocessData/:process_id", async (req, res) => {
  const processId = req.params.process_id;
  const getProcessDataQuery =
    "SELECT *, to_char(followup_date, 'YYYY-MM-DD') as formatted_followup_date, to_char(sale_date, 'YYYY-MM-DD') as formatted_sale_date FROM customer_in_process WHERE process_id = $1";
  try {
    const processDataResult = (await db.query(getProcessDataQuery, [processId]))
      .rows[0];

    res.status(200).send(processDataResult);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ====add Inprocess data into customer_in_process table ====//
//===========================================================//

inProcessRoutes.post("/inprocessData/:customer_id", async (req, res) => {
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
    follwup_date,
    inprocess,
  } = req.body;
  const customer_id = req.params.customer_id;
  try {
    const addToInprocessQuery =
      "INSERT INTO customer_in_process (customer_id, second_mob, customer_type, metal_type, walkin_source, executive_id, associate_id, product_id, fm_name, current_status, non_conversion, remarks, sale_date, followup_date, visit_dates, process_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);";
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
      follwup_date,
      sale_date,
      inprocess,
    ]);
    res.send("success");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

// ====inprocess patch request for customer_in_process table====//
//==============================================================//

inProcessRoutes.patch("/updateInprocessData/:process_id", async (req, res) => {
  const processId = req.params.process_id;
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
    inprocess,
  } = req.body;
  let visitDates = `${sale_date} - Prev. Visit date- `;
  const getVisitDatesQuery =
    "SELECT visit_dates FROM customer_in_process WHERE process_id = $1";
  const patchInprocessQuery =
    "UPDATE customer_in_process SET second_mob = $1, metal_type = $2, executive_id = $3, associate_id = $4, product_id =$5, fm_name =$6, current_status = $7, non_conversion = $8, remarks =$9, followup_date = $10, process_status = $11, visit_dates = $12 WHERE process_id = $13";
  try {
    const visitDatesResult = (await db.query(getVisitDatesQuery, [processId]))
      .rows[0];
    visitDates += visitDatesResult.visit_dates;
    await db.query(patchInprocessQuery, [
      sec_mobile,
      metal_type,
      executive_name,
      associate_name,
      product_name,
      fm_name,
      current_status,
      non_conversion,
      remarks,
      follwup_date,
      inprocess,
      visitDates,
      processId,
    ]);
    res.status(200).send({ message: "Data updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ====inprocess status change using process_id====//
//=================================================//
inProcessRoutes.patch("/updateprocessStatus/:process_id", async (req, res) => {
  const processId = req.params.process_id;
  const updateStausQuery =
    "UPDATE customer_in_process SET process_status = false WHERE process_id = $1";
  try {
    await db.query(updateStausQuery, [processId]);
    res.status(200).send({ message: "Process Status updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});
export default inProcessRoutes;
