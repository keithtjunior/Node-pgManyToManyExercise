\c biztime

DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS industries_companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE industries_companies (
    comp_code text REFERENCES companies ON DELETE CASCADE,
    indus_code text REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY(comp_code, indus_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry)
  VALUES ('mfg-comp', 'Computer Manufacturing'),
         ('mfg-comm', 'Communications Equipment Manufacturing'),
         ('retail-comp', 'Computer Stores'),
         ('retail-elec', 'Consumer Electronics Store'),
         ('info-tech', 'Information Technology'),
         ('info-movie-prod', 'Movie & Video Production'),
         ('info-search', 'Search Engines'),
         ('info-soft-publ', 'Software Publishing'),
         ('info-os-prod-publ', 'Operating Systems & Productivity Software Publishing');

INSERT INTO industries_companies (comp_code, indus_code)
  VALUES ('apple', 'mfg-comp'),
         ('apple', 'mfg-comm'),
         ('apple', 'retail-comp'),
         ('apple', 'info-movie-prod'),
         ('apple', 'info-os-prod-publ'),
         ('ibm', 'mfg-comp'),
         ('ibm', 'info-tech'),
         ('ibm', 'info-os-prod-publ');


