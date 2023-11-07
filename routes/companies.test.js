process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeAll(async function () {
  await db.query(`DELETE FROM companies`);
});

beforeEach(async function () {
  let result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('ms', 'microsoft', 'maker of pc') RETURNING code, name, description`
  );
  testCompany = result.rows[0];
});

describe("GET /companies", function () {
  test("Get list of all companies", async function () {
    const response = await request(app).get("/companies");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", function () {
  test("Get a single company", async function () {
    const response = await request(app).get(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ company: testCompany });
  });

  test("Responds with 404 if can't find company", async function () {
    const response = await request(app).get("/companies/hello");
    expect(response.statusCode).toEqual(404);
  });
});

describe("POST /companies", function () {
  test("Creates a new company", async function () {
    const response = await request(app).post("/companies").send({
      code: "abc",
      name: "abc",
      description: "alphabets",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: { code: "abc", name: "abc", description: "alphabets" },
    });
  });
});

describe("PATCH /companies/:code", function () {
  test("Updates a single company", async function () {
    const response = await request(app)
      .patch(`/companies/${testCompany.code}`)
      .send({ name: "microsoft 365", description: "microsoft 365" });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        code: testCompany.code,
        name: "microsoft 365",
        description: "microsoft 365",
      },
    });
  });

  test("Response with 404 if can't find company", async function () {
    const response = await request(app).patch(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("DELETE /companies/:code", function () {
  test("Deletes a single company", async function () {
    const response = await request(app).delete(
      `/companies/${testCompany.code}`
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "deleted" });
  });
});

afterEach(async function () {
  await db.query(`DELETE FROM companies`);
});

afterAll(async function () {
  await db.end();
});
