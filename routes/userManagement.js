import express from "express";
import db from "../services/db.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const userManag = express.Router();

userManag.get("/pandingUsers", isAuthenticated, async (req, res) => {
  const pandingUsersQuery =
    "SELECT user_id,user_name,email,roll,TO_CHAR(create_date, 'YYYY-MM-DD') AS create_date FROM user_list WHERE allow_status = true;";
  try {
    const userList = (await db.query(pandingUsersQuery)).rows;
    res.status(200).json({ userList: userList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userManag.patch("/allowUser/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const allowUserQuery =
    "UPDATE user_list SET allow_status = false, user_status = true WHERE user_id = $1";
  try {
    const result = await db.query(allowUserQuery, [id]);
    if (result.rowCount === 1) {
      res.status(200).json({ result: "successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userManag.patch("/denyUser/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const denyUserQuery =
    "UPDATE user_list SET allow_status = false WHERE user_id = $1";
  try {
    const result = await db.query(denyUserQuery, [id]);
    if (result.rowCount === 1) {
      res.status(200).json({ result: "Success" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default userManag;
