const { log } = require("console");
const fs = require("fs");
const { Client } = require("pg");
// Load environment variables from .env
require("dotenv").config();
const readline = require("readline");

start();

function start() {
  // Build client config from environment variables
  const sslCaEscaped = process.env.PG_SSL_CA || "";
  const sslCa = sslCaEscaped ? sslCaEscaped.replace(/\\n/g, "\n") : undefined;

  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_DATABASE,
    ssl: sslCa
      ? {
          rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED === "true",
          ca: sslCa,
        }
      : undefined,
  });

  client
    .connect()
    .then(() => {
      fs.readdir(".", async (err, files) => {
        if (err) throw err;
        for (let file of files) {
          if (file.endsWith(".json") && file.startsWith("gw.yad2")) {
            try {
              const data = fs.readFileSync(file, "utf8");
              const json = JSON.parse(data);
              try {
                await client.query(
                  "INSERT " +
                    "INTO " +
                    "yad2.yad2_jsons " +
                    "(json_data) " +
                    "VALUES ($1) " +
                    "ON CONFLICT (token) " +
                    "DO " +
                    "UPDATE SET json_data = EXCLUDED.json_data",
                  [JSON.stringify(json.data)]
                );

                fs.unlinkSync(file);

                log(`Inserted ${file} into public.yad2jsons`);
              } catch (dbErr) {
                console.error(`DB error for ${file}:`, dbErr);
              }
            } catch (err) {
              console.error(`Error reading ${file}:`, err);
            }
          }
        }
        console.log("Processing complete.");
        client.end();
      });
    })
    .catch((err) => {
      console.error("Failed to connect to PostgreSQL:", err);
    });
}
