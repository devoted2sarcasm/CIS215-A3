const express = require('express');
const path = require('path');
const dbOperations = require('./dbOperations');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.static('C:/NCMC/CIS215/CIS215-A3'));

app.get('/', (req, res) => {
    res.sendFile('c:/ncmc/cis215/cis215-a3/index.html');
    });

// route to get available cars
app.get('/api/login', (req, res) => {
    dbOperations.login((err, availableCars) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(availableCars);
    });
  });

  app.get('/api/carsontrips', (req, res) => {
    dbOperations.getUsedCars((err, availableCars) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(availableCars);
    });
  });
  

// Example route to add a new car
app.post('/api/cars', (req, res) => {
  const { make, model, year } = req.body;
  
  dbOperations.addCar(make, model, year, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    //res.json({ message: 'Car added successfully!' });
    res.redirect('/indexcar.html');
  });
});

//add to vehicle table
app.post('/api/add-vehicle', (req, res) => {
    const { make, model, year, dateAdded, mileage } = req.body;

    console.log('Received request to add vehicle:', req.body);

    dbOperations.addCar(make, model, year, dateAdded, mileage, (err) => {
        if (err) {
            console.error('Error adding vehicle:', err);
            res.status(500).json({ error: 'Failed to add the vehicle' });
            return;
        }

        res.redirect('/indexcar.html');
    });
});



//route to add personnel
app.post('/api/add-person', (req, res) => {
    const { firstName, lastName, middleName, dob, license, streetAddress, city, state, zip } = req.body;
    
    dbOperations.addPerson(firstName, lastName, middleName, dob, license, streetAddress, city, state, zip, (err) => {
        if (err) {
        res.status(500).json({ error: err.message });
        return;
        }
        //res.json({ message: 'Person added successfully!' });
        res.redirect('/indexcar.html');
    });
});

app.get('/api/available', (req, res) => {
    dbOperations.getAvail((err, availableCars) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(availableCars);
    });
  });

  app.post('/api/start-trip', (req, res) => {
    const { vehicleId, driverId, passengerId, reason, destination, condition, dateStart, timeStart, fuel } = req.body;

    dbOperations.startTrip(vehicleId, driverId, passengerId, reason, destination, condition, dateStart, timeStart, fuel, (err, trip) => {
        if (err) {
            console.error('Error starting the trip:', err); // Log the detailed error
            res.status(500).json({ error: 'Failed to start the trip' });
            return;
        }
        res.json(trip);
    });
});

// Add this route to handle ending a trip
app.post('/api/end-trip', (req, res) => {
    const { tripId, endingMileage, vehCondEnd, dateEnd, timeEnd, fuelEnd, issuesThisTrip } = req.body;

    dbOperations.endTrip(tripId, endingMileage, vehCondEnd, dateEnd, timeEnd, fuelEnd, issuesThisTrip, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
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
