import express from "express";
import db from "../services/db.js";

const productRoutes = express.Router();

// get all Product

productRoutes.get("/getProduct", async (req, res) => {
  try {
    const getProductQuery =
      "SELECT * FROM product_list WHERE product_status = true;";
    const productData = await db.query(getProductQuery);
    const productList = productData.rows;
    res.send(productList);
  } catch (err) {
    res.send(err.message);
  }
});

// ====Create a New product====//
// ==============================//

productRoutes.post("/createProduct", async (req, res) => {
  const { product_name } = req.body;
  const createProductQuery =
    "INSERT INTO product_list (product_name) VALUES ($1);";
  if (!product_name) {
    return res.status(400).json({ error: "Name cannot be blank" });
  }

  try {
    await db.query(createProductQuery, [product_name]);
    res.status(200).send({ message: "Product created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// ====Change product Status for Disable an existing product====//
// =================================================================//
productRoutes.patch("/disable/:id", async (req, res) => {
  const productId = req.params.id;
  const ProductDisableQuery =
    "UPDATE product_list SET status = false WHERE product_id = $1";

  try {
    await db.query(ProductDisableQuery, [productId]);
    res.status(200).send({ message: "product disabled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

export default productRoutes;
