/** BizTime express application. */
require("dotenv").config();

const express = require("express");

const app = express();

const slugify = require("slugify");

const ExpressError = require("./expressError");

const companiesRoutes = require("./routes/companies");

const invoiceRoutes = require("./routes/invoices");

app.use(express.json());

app.use("/companies", companiesRoutes);

app.use("/invoices", invoiceRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  let status = err.status || 500;

  return res.status(status).json({
    error: {
      message: err.message,
      status: status,
    },
  });
});

module.exports = app;
