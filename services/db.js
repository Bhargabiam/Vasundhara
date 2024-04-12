import pkg from "pg";
import "dotenv/config";
const { Pool } = pkg;
const DB = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// const DB = new pg.Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// DB.connect();

export default DB;
