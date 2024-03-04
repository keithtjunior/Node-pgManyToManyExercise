process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let co, indus, mfg, ic;

beforeEach(async () => {
  const compResults = await db.query(`INSERT INTO companies (code, name, description) VALUES ('google', 'Google', 'Developers of Chrome') RETURNING *`);
  const indusResults = await db.query(`INSERT INTO industries (code, industry) VALUES ('info-search', 'Search Engines') RETURNING *`);
  const mfgResults = await db.query(`INSERT INTO industries (code, industry) VALUES ('mfg-comp', 'Computer Manufacturing') RETURNING *`);
  co = compResults.rows[0];
  indus = indusResults.rows[0];
  mfg = mfgResults.rows[0];
  const icResults = await db.query(`INSERT INTO industries_companies (comp_code, indus_code) VALUES ('google', 'info-search')`);
  ic = icResults.rows[0];
})

afterEach(async () => {
  await db.query(`DELETE FROM industries_companies`);
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM industries`);
})

afterAll(async () => {
  await db.end();
})

describe("GET /industries", () => {
  test("get a list of industries", async () => {
    const res = await request(app).get('/industries');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      industries: [{...indus, companies: [{ code: co.code, name: co.name }]},
      {...mfg, companies: []}]
    });
  });
})

describe("POST /industries", () => {
  test("create a industry", async () => {
    const res = await request(app).post('/industries').send({ 
        code: 'info-tech', industry: 'Information Technology' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ 
        industry: { code: 'info-tech', industry: 'Information Technology' }});
  });
})

describe("POST /industries/:code", () => {
  test("associates an industry to a company", async () => {
    const res = await request(app).post(`/industries/${mfg.code}`).send({comp_code: co.code});
    expect(res.statusCode).toBe(201);
    console.log(res.body);
    expect(res.body).toEqual({added: {industry: {industry: mfg.industry, code: mfg.code},
      company: {name: co.name, code: co.code}}});
  });
  test("responds 404 for invalid company code", async () => {
    const res = await request(app).patch(`/industries/0`).send({comp_code: co.code});
    expect(res.statusCode).toBe(404);
  });
})
