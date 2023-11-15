const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [req.body.code, req.body.industry]
    );
    return res.json({ industry: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT i.code, i.industry, c.name 
        FROM industries AS i 
            LEFT JOIN sector 
                ON i.code = ind_code 
            LEFT JOIN companies AS c 
                ON c.code = comp_code 
        WHERE $1 = i.code`,
      [req.params.code]
    );

    let { code, industry } = result.rows[0];
    let names = result.rows.map((r) => r.name);

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There is no company with id '${req.params.code}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return res.json({ code, industry, names });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
