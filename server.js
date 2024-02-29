/*DB SCHEMA
CREATE TABLE "accounts" (
	"id"	INTEGER NOT NULL UNIQUE,
	"balance"	INTEGER NOT NULL,
	"recent_tx"	INTEGER,
	"opened"	TEXT NOT NULL,
	"owner_id"	INTEGER NOT NULL,
	"overdrawn"	BOOLEAN NOT NULL,
	FOREIGN KEY("recent_tx") REFERENCES "transaction"("id"),
	FOREIGN KEY("owner_id") REFERENCES "users"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE "transaction" (
	"id"	INTEGER NOT NULL UNIQUE,
	"timestamp"	TEXT NOT NULL,
	"type"	TEXT NOT NULL,
	"amt"	NUMERIC NOT NULL,
	"begin_bal"	NUMERIC,
	"end_bal"	NUMERIC NOT NULL,
	"user"	INTEGER NOT NULL,
	"acct"	INTEGER NOT NULL,
	FOREIGN KEY("user") REFERENCES "users"("id"),
	FOREIGN KEY("acct") REFERENCES "accounts"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"firname"	TEXT,
	"lasname"	TEXT,
	"midname"	TEXT,
	"email"	TEXT,
	"phone"	INTEGER,
	"street_address"	INTEGER,
	"zip"	NUMERIC,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TRIGGER overdraw
AFTER UPDATE ON accounts
FOR EACH ROW
WHEN NEW.balance < 0
BEGIN
    UPDATE accounts
    SET overdrawn = 1
    WHERE id = NEW.id;
END

*/





const express = require('express');
const cors = require('cors');
const path = require('path');
const dbOperations = require('./dbOperations');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.static('C:/NCMC/CIS215/CIS215-A3'));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile('c:/ncmc/cis215/cis215-a3/index.html');
    });


    app.post('/api/createUser', (req, res) => {
        const { fn, ln, mn, em, ph, sa, zip, pw } = req.body;
      
        dbOperations.createUser(fn, ln, mn, em, ph, sa, zip, pw, (err) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.status(201).send('User created successfully');
          }
        });
      });
      
      app.post('/api/login', (req, res) => {
        const { em, pw } = req.body;
      
        dbOperations.login(em, pw, (err, userId) => {
          if (err) {
            res.status(500).send(err.message);
          } else if (userId) {
            res.status(200).send({ userId });
          } else {
            res.status(401).send('Login failed');
          }
        });
      });
      
      app.post('/api/deposit', (req, res) => {
        const { amt, acct } = req.body;
      
        dbOperations.deposit(amt, acct, (err) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.status(201).send('Deposit successful');
          }
        });
      });
      
      app.post('/api/withdraw', (req, res) => {
        const { amt, acct } = req.body;
      
        dbOperations.withdraw(amt, acct, (err) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.status(201).send('Withdrawal successful');
          }
        });
      });
      
      app.get('/api/balance/:acct', (req, res) => {
        const { acct } = req.params;
      
        dbOperations.getBalance(acct, (err, balance) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.status(200).send({ balance });
          }
        });
      });
      
      app.get('/api/transactions/:acct', (req, res) => {
        const { acct } = req.params;
      
        dbOperations.mostRecentTx(acct, (err, transactions) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.status(200).send(transactions);
          }
        });
      });
      
      app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
      });
      
      process.on('exit', () => {
        dbOperations.closeDatabase();
      });