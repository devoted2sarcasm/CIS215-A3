const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('bank.db');



function createUser(fn, ln, mn, em, ph, sa, zip, pw, callback) {
  const insertUserQuery = `INSERT INTO users (firname, lasname, midname, email, phone, street_address, zip, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(insertUserQuery, [fn, ln, mn, em, ph, sa, zip, pw], function (err) {
    if (err) {
      callback(err);
      return;
    }
    
    const userId = this.lastID;

    // Open an account for the user
    const createAccountQuery = `INSERT INTO accounts (balance, opened, owner_id, overdrawn) VALUES (0, CURRENT_TIMESTAMP, ?, 0)`;
    db.run(createAccountQuery, [userId], function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}


// function to login and pass the authenticated user id to the accountinfo page
function login(email, password, callback) {
  const loginQuery = `SELECT id FROM users WHERE email = ? AND password = ?`;
  console.log('loginQuery: ', loginQuery);
  console.log('em: ', email);
  console.log('pw: ', password);
  db.get(loginQuery, [email, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      callback(err, null);
      return;
    }
    if (row) {
      console.log('login success, user id: ', row.id);
      callback(null, row.id);
    } else {
      console.log('login failed, no user found with those credentials.');
      callback(null, null);
    }
  });
}

// making a deposit
function deposit(amt, acct, callback) {
  const depositQuery = 'INSERT INTO transaction (timestamp, type, amt, begin_bal, end_bal, user, acct) VALUES (CURRENT_TIMESTAMP, "deposit", ?, (SELECT balance FROM accounts WHERE id = ?), (SELECT balance + ? FROM accounts WHERE id = ?), (SELECT owner_id FROM accounts WHERE id = ?), ?)';
  db.run(depositQuery, [amt, acct, amt, acct, acct, acct], (err) => {
    if (err) {
      callback(err);
      return;
    }
    const updateBalanceQuery = 'UPDATE accounts SET balance = balance + ? WHERE id = ?';
    db.run(updateBalanceQuery, [amt, acct], (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

// making a withdrawal
function withdraw(amt, acct, callback) {
  const withdrawQuery = 'INSERT INTO transaction (timestamp, type, amt, begin_bal, end_bal, user, acct) VALUES (CURRENT_TIMESTAMP, "withdrawal", ?, (SELECT balance FROM accounts WHERE id = ?), (SELECT balance - ? FROM accounts WHERE id = ?), (SELECT owner_id FROM accounts WHERE id = ?), ?)';
  db.run(withdrawQuery, [amt, acct, amt, acct, acct, acct], (err) => {
    if (err) {
      callback(err);
      return;
    }
    const updateBalanceQuery = 'UPDATE accounts SET balance = balance - ? WHERE id = ?';
    db.run(updateBalanceQuery, [amt, acct], (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

// function to make an account overdrawn
function overdraw(acct, callback) {
  const overdrawQuery = 'UPDATE accounts SET overdrawn = 1 WHERE id = ?';
  db.run(overdrawQuery, [acct], (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

// check for overdrawn and retuen true/false
function isOverdrawn(acct, callback) {
  const overdrawnQuery = 'SELECT overdrawn FROM accounts WHERE id = ?';
  db.get(overdrawnQuery, [acct], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (row.overdrawn) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
}

// get current balance 
function getBalance(acct, callback) {
  const balanceQuery = 'SELECT balance FROM accounts WHERE id = ?';
  db.get(balanceQuery, [acct], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, row.balance);
  });
}

// get 20 most recent transactions
function mostRecentTx(acct, callback) {
  const recentTxQuery = 'SELECT * FROM transaction WHERE acct = ? ORDER BY timestamp DESC LIMIT 20';
  db.all(recentTxQuery, [acct], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
}

// logout
function logout(callback) {
  callback(null);
}

// get first name, last name and current balance for display on accountinfo page
function accountInfo(acct, callback) {
  const accountInfoQuery = 'SELECT firname, lasname, balance FROM users JOIN accounts ON users.id = accounts.owner_id WHERE accounts.id = ?';
  db.get(accountInfoQuery, [acct], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, row);
  });
}

// validate login credentials
function validateLogin(em, pw, callback) {
  const loginQuery = 'SELECT id FROM users WHERE email = ? AND password = ?';
  db.get(loginQuery, [em, pw], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (row) {
      callback(null, row.id);
    } else {
      callback(null, null);
    }
  });
}




// Close the database connection when done
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}

module.exports = {
    login,
    withdraw,
    deposit,
    overdraw,
    //openAccount,
    //closeAccount,
    getBalance,
    mostRecentTx,
    closeDatabase,
    createUser,
};
