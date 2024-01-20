import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import "dotenv/config";
import router from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(bodyParser.json());

// Use the routes
app.use("/", router);
// app.use("/api", router);

// Middleware to log loaded routes
// app.use((req, res, next) => {
//   console.log(
//     "Loaded routes:",
//     router.stack.map((r) => r.route?.path)
//   );
//   next();
// });

// app.get("/", (req, res) => {
//   res.render("index");
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
