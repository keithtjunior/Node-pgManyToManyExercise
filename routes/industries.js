/** Routes for industries */

const express = require('express');
const router = new express.Router();
const slugify = require('slugify');

const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async function(req, res, next) {
    try {
        const indusResults = await db.query(`SELECT * FROM industries`);
        const compResults = await db.query(
            `SELECT *
            FROM industries i 
            JOIN industries_companies ic 
            ON i.code = ic.indus_code
            JOIN companies c 
            ON c.code = ic.comp_code`
        );
        const industries = indusResults.rows.map(i => ({industry:i.industry, code:i.code, companies:[
            ...new Set(compResults.rows.map(c => { 
                if(i.code === c.indus_code) return { name:c.name, code:c.code }
            }))].filter(r => r)}));
        return res.json({ industries });
    } catch(err){
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const code = req.body.code || slugify(industry, {lower:true, strict:true});
        const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [code, industry]);
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        return next(e);
    }
  });

router.post('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { comp_code } = req.body;
        const indusResults = await db.query('SELECT * FROM industries WHERE code=$1', [code]);
        if (indusResults.rows.length === 0)
            throw new ExpressError(`Not found: unable to update industry with code of {${code}}`, 404);
        const compResults = await db.query(`
            SELECT * 
            FROM companies c 
            LEFT JOIN industries_companies ic ON c.code = ic.comp_code 
            WHERE c.code = $1
        `, [comp_code]);
        if (compResults.rows.length === 0)
            throw new ExpressError(`Not found: unable to update company with code of {${comp_code}}`, 404);
        if (!([...compResults.rows].every(c => c.indus_code !== code)))
            throw new ExpressError(`Error: unable to insert duplicate values {${comp_code}} & {${code}}`, 500);
        const results = await db.query(`INSERT INTO industries_companies (comp_code, indus_code) VALUES ($1, $2)`, [comp_code, code]);
        return res.status(201).json({ added: {industry: {industry:indusResults.rows[0].industry, code}, company: {name:compResults.rows[0].name, code:compResults.rows[0].code}} });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;