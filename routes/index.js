import express from "express";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js";
import salesRoutes from "./salesRoutes.js";
import inProcessRoutes from "./inProcessRoutes.js";
import executiveRoutes from "./executiveRoutes.js";
import productRoutes from "./productRoutes.js";
import reportRoutes from "./reportRoutes.js";
import tableRoutes from "./tableRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import userManag from "./userManagement.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/sales", salesRoutes);
router.use("/inProcess", inProcessRoutes);
router.use("/executive", executiveRoutes);
router.use("/product", productRoutes);
router.use("/report", reportRoutes);
router.use("/table", tableRoutes);
router.use("/index", dashboardRoutes);
router.use("/user", userManag);

export default router;
