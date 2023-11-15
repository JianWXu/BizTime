const express = require("express");
const slugify = require("slugify");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query("SELECT * FROM companies");
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT c.code, c.name, c.description, i.industry
        FROM companies AS c
          LEFT JOIN sector
            ON c.code = comp_code
          LEFT JOIN industries AS i ON i.code = ind_code
        WHERE c.code = $1`,
      [req.params.code]
    );

    let { code, name, description } = result.rows[0];
    let industries = result.rows.map((r) => r.industry);

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There is no company with id '${req.params.code}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return res.json({ code, name, description, industries });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let slugName = slugify(req.body.code, { lower: true });
    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [slugName, req.body.name, req.body.description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.patch("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [req.body.name, req.body.description, req.params.code]
    );

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There is no company with id '${req.params.code}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING code`,
      [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no company with name of ${req.params.code}`,
        403
      );
    }
    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
