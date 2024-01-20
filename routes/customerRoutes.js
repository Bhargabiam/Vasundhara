import express from "express";
import db from "../services/db.js";

const customerRoutes = express.Router();

// ====Render addNewCustomer Page ====//
// ===================================//
customerRoutes.get("/addNewCustomer", (req, res) => {
  res.render("create_customer");
});

// i have to Check
customerRoutes.get("/findCustomer", async (req, res) => {
  try {
    res.render("findCustomer");
  } catch (err) {
    console.error(err);
  }
});

// =====get a Customer Data ====//
//==============================//
customerRoutes.get("/getCustomer/:customer_id", async (req, res) => {
  const customerId = req.params.customer_id;
  try {
    const getCustomerDataQuery =
      "SELECT * FROM customer_details WHERE customer_id = $1";
    const customerDataResult = await db.query(getCustomerDataQuery, [
      customerId,
    ]);
    const customerData = customerDataResult.rows[0];

    res.send(customerData);
  } catch (err) {
    res.send(err.message);
  }
});

// ====Add new Customer In Database====//
// ====================================//
customerRoutes.post("/addCustomer", async (req, res) => {
  const {
    customer_mobile,
    customer_name,
    customer_email,
    customer_address,
    customer_dob,
  } = req.body;
  try {
    const isNewCustomerQuery =
      "SELECT customer_mobile FROM customer_details WHERE customer_mobile = $1";
    const isNewCustomer = await db.query(isNewCustomerQuery, [customer_mobile]);

    if (isNewCustomer.rows.length === 0) {
      try {
        const addCustomerQuery =
          "INSERT INTO customer_details (customer_name, customer_mobile, customer_email, customer_address, customer_dob) VALUES ($1,$2,$3,$4,$5);";
        const getCustomerIdQuery =
          "SELECT * FROM customer_details WHERE customer_mobile = $1";
        await db.query(addCustomerQuery, [
          customer_name,
          customer_mobile,
          customer_email,
          customer_address,
          customer_dob,
        ]);
        const result = await db.query(getCustomerIdQuery, [customer_mobile]);
        const customerId = result.rows[0].customer_id;
        res.send({ status: true, customer_id: customerId });
      } catch (err) {
        console.error(err.message);
      }
    } else {
      const error = "Customer is already exist";
      res.send(error);
    }
  } catch (err) {}
});

// ==== Check customer is in database if yes then check is in Inprocess Table =====//
// ===============================================================================//
customerRoutes.post("/findCustomer/:mob_number", async (req, res) => {
  const mobNumber = req.params.mob_number;
  const findCustomerQuery =
    "SELECT * FROM customer_details where customer_mobile = $1";
  const findIsInprocessQuery =
    "SELECT process_id, customer_name, metal_type, executive_name, product_name, current_status, to_char(followup_date, 'YYYY-MM-DD') as followup_date FROM customer_in_process INNER JOIN customer_details ON customer_details.customer_id = customer_in_process.customer_id INNER JOIN executive_list ON executive_list.executive_id = customer_in_process.executive_id INNER JOIN product_list ON product_list.product_id = customer_in_process.product_id WHERE customer_in_process.customer_id = $1 AND process_status = true;";
  try {
    const result = await db.query(findCustomerQuery, [mobNumber]);
    const customerDetail = result.rows[0];

    if (result.rows.length === 0) {
      res.send(false);
    } else {
      try {
        const customerId = customerDetail.customer_id;
        const customerName = customerDetail.customer_name;
        let inprocessResult = await db.query(findIsInprocessQuery, [
          customerId,
        ]);
        if (inprocessResult.rows.length != 0) {
          res.json({
            inprocessData: inprocessResult.rows,
            customerId: customerId,
          });
        } else {
          res.json({
            customerName: customerName,
            customerID: customerId,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// // This is not working
// app.get("/addNewCustomer", (req, res) => {
//   console.log("Add new customer");
//   const mobileNumber = req.query.mobileNumber;
//   console.log(mobileNumber);
//   res.json(mobileNumber);
// });

export default customerRoutes;