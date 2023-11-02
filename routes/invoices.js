const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const results = await db.query("SELECT * FROM invoices WHERE id=$1", [
      req.params.id,
    ]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} cannot be found`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const results = await db.query(
      "INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING comp_Code, amt, paid, paid_date",
      [req.body.comp_Code, req.body.amt, req.body.paid, req.body.paid_date]
    );
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const results = await db.query(
      "UPDATE invoices SET comp_Code=$1, amt=$2, paid=$3, paid_date=$4 WHERE id=$5 RETURNING comp_Code, amt, paid, paid_date",
      [
        req.body.comp_Code,
        req.body.amt,
        req.body.paid,
        req.body.paid_date,
        req.params.id,
      ]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Invoice ${req.params.id} cannot be found`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const results = await db.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Invoice ${req.params.id} cannot be found`, 404);
    }
    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});


module.exports = router;
