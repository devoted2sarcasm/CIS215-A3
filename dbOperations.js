const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('bank.db');

// Function to get all cars from the database
function login(callback) {
  db.all('SELECT email, password FROM users WHERE email = ?', (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
}

//function to retrieve available cars
function getAvail(callback) {
    db.all('SELECT id, veh_make as "Make", veh_model as "Model", veh_year as "Year" FROM Vehicle WHERE current_use = 0 OR current_use IS null OR current_use = false;', (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      // Convert the rows to a JSON object if needed
      const result = rows.map(row => ({
        id: row.id,
        Make: row.Make,
        Model: row.Model,
        Year: row.Year,
      }));
      callback(null, result);
    });
  }

  //function to retrieve cars currently in use
function getUsedCars(callback) {
    db.all('SELECT id, veh_make as "Make", veh_model as "Model", veh_year as "Year" FROM Vehicle WHERE current_use = 1;', (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      // Convert the rows to a JSON object if needed
      const result = rows.map(row => ({
        id: row.id,
        Make: row.Make,
        Model: row.Model,
        Year: row.Year,
      }));
      callback(null, result);
    });
  }

// Function to start a trip
function startTrip(vehicleId, driverId, passengerId, reason, destination, condition, dateStart, timeStart, fuel, callback) {
    // Start a transaction to ensure data consistency
    db.serialize(() => {
      // 1. Insert a new entry to the trips table
      db.run(
        'INSERT INTO Trips (vehicle_used, driver, passenger, reason_for_trip, destination_zip, veh_cond_start, date_start, time_start, fuel_begin, starting_mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT mileage FROM Vehicle WHERE id = ?))',
        [vehicleId, driverId, passengerId, reason, destination, condition, dateStart, timeStart, fuel, vehicleId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
  
          const tripId = this.lastID;
  
          // 2. Update the boolean on the vehicle table for current_use to true for the chosen car
          db.run('UPDATE Vehicle SET current_use = 1 WHERE id = ?', [vehicleId], function (err) {
            if (err) {
              callback(err);
              return;
            }
  
            // 3. Increment the trips_as_driver field on the occupants table for the driver (if driverId is provided)
            if (driverId) {
              db.run('UPDATE Occupants SET trips_as_driver = trips_as_driver + 1 WHERE id = ?', [driverId], function (err) {
                if (err) {
                  callback(err);
                  return;
                }
  
                // 4. Increment the trips_as_passenger field on the occupants table for the passenger (if passengerId is provided)
                if (passengerId) {
                  db.run('UPDATE Occupants SET trips_as_pass = trips_as_pass + 1 WHERE id = ?', [passengerId], function (err) {
                    if (err) {
                      callback(err);
                      return;
                    }
  
                    // Retrieve the newly inserted trip data
                    db.get('SELECT * FROM Trips WHERE id = ?', [tripId], (err, row) => {
                      if (err) {
                        callback(err);
                        return;
                      }
  
                      callback(null, row);
                    });
                  });
                } else {
                  // Retrieve the newly inserted trip data
                  db.get('SELECT * FROM Trips WHERE id = ?', [tripId], (err, row) => {
                    if (err) {
                      callback(err);
                      return;
                    }
  
                    callback(null, row);
                  });
                }
              });
            } else {
              // Retrieve the newly inserted trip data
              db.get('SELECT * FROM Trips WHERE id = ?', [tripId], (err, row) => {
                if (err) {
                  callback(err);
                  return;
                }
  
                callback(null, row);
              });
            }
          });
        }
      );
    });
  }
  

//function to end a trip, autopopulating to select from the current cars in use to select the trip to end


// Function to add a new car to the database
function addCar(make, model, year, date_added, miles, callback) {

    db.run('INSERT INTO Vehicle (veh_make, veh_model, veh_year, added_to_fleet, original_mileage) VALUES (?, ?, ?, ?, ?)', [make, model, year, date_added, miles], function (err) {
        if (err) {
            if (callback && typeof callback === 'function') {
                callback(err);
            } else {
                console.error('Error in addCar:', err);
            }
            return;
        }
        
        if (callback && typeof callback === 'function') {
            callback(null);
        } else {
            console.error('Callback not provided or not a function in addCar');
        }
    });
}



//function for adding personnel to the database
function addPerson(firstName, lastName, middleName, dob, driver_lic_num, street_address, city, state, zip, callback) {
    db.run('INSERT INTO Occupants (firstname, lastname, middlename, dob, driver_lic_num, street_address, city, state, zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, middleName, dob, driver_lic_num, street_address, city, state, zip], (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  
}

//function to end a trip
// Add this function to dbOperations.js
function endTrip(tripId, endingMileage, vehCondEnd, dateEnd, timeEnd, fuelEnd, issuesThisTrip, callback) {
    db.serialize(() => {
        // Update the trip details
        db.run('UPDATE Trips SET ending_mileage = ?, veh_cond_end = ?, date_end = ?, time_end = ?, fuel_end = ?, issues_this_trip = ? WHERE id = ?', [endingMileage, vehCondEnd, dateEnd, timeEnd, fuelEnd, issuesThisTrip, tripId], (err) => {
            if (err) {
                callback(err);
                return;
            }

            // Get the vehicle ID associated with the ended trip
            db.get('SELECT vehicle_used FROM Trips WHERE id = ?', [tripId], (err, row) => {
                if (err) {
                    callback(err);
                    return;
                }

                const vehicleId = row.vehicle_used;

                // Update the current_use boolean to 0 for the associated vehicle
                db.run('UPDATE Vehicle SET current_use = 0 WHERE id = ?', [vehicleId], (err) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    callback(null);
                });
            });
        });
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
    openAccount,
    closeAccount,
    getBalance,
    mostRecentTx,
    closeDatabase,
    createUser,
};
