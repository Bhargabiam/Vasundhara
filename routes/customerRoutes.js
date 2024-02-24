import express from "express";
import db from "../services/db.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { Vonage } from "@vonage/server-sdk";
import axios from "axios";

const vonage = new Vonage({
  apiKey: "6e4ee504",
  apiSecret: "ttiauLyBIBbmA99V",
});

const apiKey = "6e4ee504";
const apiSecret = "ttiauLyBIBbmA99V";

// Define the message data
// const messageData = {
//   from: "14157386102",
//   to: "918240231376",
//   message_type: "text",
//   text: "This is a WhatsApp Message sent from the Messages API",
//   channel: "whatsapp",
// };

// Define the request headers
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString(
    "base64"
  )}`,
};

const customerRoutes = express.Router();

// ====Render addNewCustomer Page ====//
// ===================================//
customerRoutes.get("/addNewCustomer", (req, res) => {
  res.render("create_customer");
});

// i have to Check
customerRoutes.get("/findCustomer", isAuthenticated, async (req, res) => {
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
    customerMobile,
    customerName,
    customerEmail,
    customerAddress,
    customerDob,
  } = req.body;
  const isNewCustomerQuery =
    "SELECT customer_mobile FROM customer_details WHERE customer_mobile = $1";
  const addCustomerQuery =
    "INSERT INTO customer_details (customer_name, customer_mobile, customer_email, customer_address, customer_dob) VALUES ($1,$2,$3,$4,$5) RETURNING *;";
  const addCustomerWithoutDateQuery =
    "INSERT INTO customer_details (customer_name, customer_mobile, customer_email, customer_address) VALUES ($1,$2,$3,$4) RETURNING *;";

  async function sendSMS(number, id) {
    const from = "Vasundhara";
    const to = `91${number}`;
    const text = `Welcome to Vasundhara Family. Your unique 'Id' is +${id}`;
    await vonage.sms
      .send({ to, from, text })
      .then((resp) => {
        console.log("Message sent successfully");
        console.log(resp);
      })
      .catch((err) => {
        console.log("There was an error sending the messages.");
        console.error(err);
      });
  }
  try {
    const isNewCustomer = await db.query(isNewCustomerQuery, [customerMobile]);

    if (isNewCustomer.rows.length === 0) {
      try {
        if (customerDob) {
          const result = await db.query(addCustomerQuery, [
            customerName,
            customerMobile,
            customerEmail,
            customerAddress,
            customerDob,
          ]);
          const customerId = result.rows[0].customer_id;
          // Whatasapp Implimentation
          // axios
          //   .post(
          //     "https://messages-sandbox.nexmo.com/v1/messages",
          //     messageData,
          //     { headers }
          //   )
          //   .then((response) => {
          //     console.log("Message sent successfully:", response.data);
          //   })
          //   .catch((error) => {
          //     console.error("Error sending message:", error.response.data);
          //   });
          // sendSMS(customerMobile, customerId);
          res.status(200).json({ customer_id: customerId });
        } else {
          const result = await db.query(addCustomerWithoutDateQuery, [
            customerName,
            customerMobile,
            customerEmail,
            customerAddress,
          ]);
          const customerId = result.rows[0].customer_id;
          const messageData = {
            from: "14157386102",
            to: `91${customerMobile}`,
            message_type: "text",
            text: `Hi! ${customerName} Welcome To Vasundhara Diamond Roof. Here it's your unique Id ${customerId}, Thank You!`,
            channel: "whatsapp",
          };
          // Whatasapp Implimentation
          // axios
          //   .post(
          //     "https://messages-sandbox.nexmo.com/v1/messages",
          //     messageData,
          //     { headers }
          //   )
          //   .then((response) => {
          //     console.log("Message sent successfully:", response.data);
          //   })
          //   .catch((error) => {
          //     console.error("Error sending message:", error.response.data);
          //   });
          // sendSMS(customerMobile, customerId);
          res.status(200).json({ customer_id: customerId });
        }
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(400).json({ error: "Customer is already exist" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
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
