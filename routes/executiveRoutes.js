import express from "express";
import db from "../services/db.js";

const executiveRoutes = express.Router();

// get all Executive names

executiveRoutes.get("/getExecutive", async (req, res) => {
  try {
    const getExecutiveQuery =
      "SELECT * FROM executive_list WHERE executive_status = true;";
    const executiveData = await db.query(getExecutiveQuery);
    const executiveList = executiveData.rows;
    res.send(executiveList);
  } catch (err) {
    res.send(err.message);
  }
});

// ====Create a New executive====//
// ==============================//

executiveRoutes.post("/createExecutive", async (req, res) => {
  const { executive_name } = req.body;
  const createExecutiveQuery =
    "INSERT INTO executive_list (executive_name) VALUES ($1);";
  if (!executive_name) {
    return res.status(400).json({ error: "Name cannot be blank" });
  }

  try {
    await db.query(createExecutiveQuery, [executive_name]);
    res.status(200).send({ message: "Executive created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// ====Change executive Status for Disable an existing Executive====//
// =================================================================//
executiveRoutes.patch("/disable/:id", async (req, res) => {
  const executiveId = req.params.id;
  const executiveDisableQuery =
    "UPDATE executive_list SET executive_status = false WHERE executive_id = $1";

  try {
    await db.query(executiveDisableQuery, [executiveId]);
    res.status(200).send({ message: "Executive disabled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

export default executiveRoutes;
