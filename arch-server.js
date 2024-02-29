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
const path = require('path');
const dbOperations = require('./dbOperations');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.static('C:/NCMC/CIS215/CIS215-A3'));

app.get('/', (req, res) => {
    res.sendFile('c:/ncmc/cis215/cis215-a3/index.html');
    });

app.post('/api/createUser', (req, res) => {
  const {fn, ln, mn, em, ph, sa, zip, pw} = req.body;
  
  const insertUserQuery = `INSERT INTO users (firname, lasname, midname, email, phone, street_address, zip, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(insertUserQuery, [fn, ln, mn, em, ph, sa, zip, pw], (err) => {
    if (err) {
      res.status(500).send(err);
      res.status(500).send('Error creating user');
      return;
    }
    const userId = this.lastID;
    const createAccountQuery = `INSERT INTO accounts (balance, opened, owner_id, overdrawn) VALUES (0, CURRENT_TIMESTAMP, ?, 0)`;
    db.run(createAccountQuery, [userId], (err) => {
      if (err) {
        res.status(500).send(err);
        res.status(500).send('Error creating account');
        return;
      }
      res.status(201).send('User created');
    });
  });
});

app.post('/api/login', (req, res) => {
  const {em, pw} = req.body;
  const loginQuery = `SELECT id FROM users WHERE email = ? AND password = ?`;
  db.get(loginQuery, [em, pw], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (row) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Login failed');
    }
  });
});

app.post('/api/deposit', (req, res) => {
  const {amt, acct} = req.body;
  const depositQuery = 'INSERT INTO transaction (timestamp, type, amt, begin_bal, end_bal, user, acct) VALUES (CURRENT_TIMESTAMP, "deposit", ?, (SELECT balance FROM accounts WHERE id = ?), (SELECT balance + ? FROM accounts WHERE id = ?), (SELECT owner_id FROM accounts WHERE id = ?), ?)';
  db.run(depositQuery, [amt, acct, amt, acct, acct, acct], (err) => {
    if (err) {
      res.status(500).send(err);
      res.status(500).send('Error depositing funds');
      return; 
    }
    const updateBalanceQuery = 'UPDATE accounts SET balance = balance + ? WHERE id = ?';
    db.run(updateBalanceQuery, [amt, acct], (err) => {
      if (err) {
        res.status(500).send(err);
        res.status(500).send('Error updating balance');
        return;
      }
      res.status(201).send('Deposit successful');
    }
  });
});

app.post('/api/withdraw', (req, res) => {
  const {amt, acct} = req.body;
  const withdrawQuery = 'INSERT INTO transaction (timestamp, type, amt, begin_bal, end_bal, user, acct) VALUES (CURRENT_TIMESTAMP, "withdraw", ?, (SELECT balance FROM accounts WHERE id = ?), (SELECT balance - ? FROM accounts WHERE id = ?), (SELECT owner_id FROM accounts WHERE id = ?), ?)';
  db.run(withdrawQuery, [amt, acct, amt, acct, acct, acct], (err) => {
    if (err) {
      res.status(500).send(err);
      res.status(500).send('Error withdrawing funds');
      return;
    }
    const updateBalanceQuery = 'UPDATE accounts SET balance = balance - ? WHERE id = ?';
    db.run(updateBalanceQuery, [amt, acct], (err) => {
      if (err) {
        res.status(500).send(err);
        res.status(500).send('Error updating balance');
        return;
      }
      res.status(201).send('Withdrawal successful');
    });
  });
});

app.get('/api/balance/:acct', (req, res) => {
  const {acct} = req.params;
  const balanceQuery = 'SELECT balance FROM accounts WHERE id = ?';
  db.get(balanceQuery, [acct], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(row);
  });
});

//api call to get most recent 20 transactions
app.get('/api/transactions/:acct', (req, res) => {
  const {acct} = req.params;
  const transactionsQuery = 'SELECT * FROM transaction WHERE acct = ? ORDER BY timestamp DESC LIMIT 20';
  db.all(transactionsQuery, [acct], (err, rows) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(rows);
  });
});

//logout
app.get('/api/logout', (req, res) => {
  res.status(200).send('Logout successful');
});

//get first name, last name, and current balance for display on accountinfo page
app.get('/api/accountinfo/:acct', (req, res) => {
  const {acct} = req.params;
  const accountInfoQuery = 'SELECT firname, lasname, balance FROM users JOIN accounts ON users.id = accounts.owner_id WHERE accounts.id = ?';
  db.get(accountInfoQuery, [acct], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(row);
  });
});

app.get('/api/accountinfo/${userId}', (req, res) => {
  const {userId} = req.params;
  const accountInfoQuery = 'SELECT firname, lasname, balance FROM users JOIN accounts ON users.id = accounts.owner_id WHERE accounts.id = ?';
  db.get(accountInfoQuery, [userId], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(row);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Close the database connection when the server is closed
process.on('exit', () => {
  dbOperations.closeDatabase();
});
