/** Database setup for BizTime. */

const app = require("./app");
const { Client } = require("pg");
pw = process.env.PW;

const DB_URI =
  process.env.NODE_ENV === "test"
    ? `postgresql://postgres:${pw}@localhost/biztime_test`
    : `postgresql://postgres:${pw}@localhost/biztime`;

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
