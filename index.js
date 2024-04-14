const express = require('express');
const bodyParser = require('body-parser');
const ibmdb = require("ibm_db");
const path = require('path'); // Import the path module

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to establish a connection to the DB2 database
function connectToDb(callback) {
    ibmdb.open("DRIVER={DB2};HOSTNAME=3883e7e4-18f5-4afe-be8c-fa31c41761d2.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=dsb86290;PWD=P46bclzD5lBc1UHj;PORT=31498;DATABASE=bludb;PROTOCOL=TCPIP;SECURITY=SSL", callback);
}

// Retrieve all records
app.get('/retrieveAll', (req, res) => {
    connectToDb((err, conn) => {
        if (err) return res.status(500).json({ error: err });

        conn.query("SELECT * FROM dsb86290.P11", (err, data) => {
            conn.close(() => {
                if (err) return res.status(500).json({ error: err });
                res.json(data);
            });
        });
    });
});

// Retrieve a single record by EmployeeID
app.get('/retrieve', (req, res) => {
    const employeeID = req.query.employeeID; // Accessing employeeID from query parameters
    connectToDb((err, conn) => {
        if (err) return res.status(500).json({ error: err });

        conn.query("SELECT * FROM dsb86290.P11 WHERE employeeID = ?", [employeeID], (err, data) => {
            conn.close(() => {
                if (err) return res.status(500).json({ error: err });
                res.json(data);
            });
        });
    });
});

// Update employee data by EmployeeID
app.post('/update', (req, res) => {
    const { employeeID, ...employeeDetails } = req.body;
    connectToDb((err, conn) => {
        if (err) return res.status(500).json({ error: err });

        conn.query("UPDATE dsb86290.P11 SET ? WHERE employeeID = ?", [employeeDetails, employeeID], (err, data) => {
            conn.close(() => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: 'Employee data updated successfully' });
            });
        });
    });
});

// Delete record of an employee with given EmployeeID
app.post('/delete', (req, res) => {
    const { employeeID } = req.body;
    connectToDb((err, conn) => {
        if (err) return res.status(500).json({ error: err });

        conn.query("DELETE FROM dsb86290.P11 WHERE employeeID = ?", [employeeID], (err, data) => {
            conn.close(() => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: 'Record deleted successfully' });
            });
        });
    });
});

// Register employee data
app.post('/register', (req, res) => {
    const { employeeID, firstName, lastName, department, salary } = req.body;
    connectToDb((err, conn) => {
        if (err) return res.status(500).json({ error: err });

        conn.query("INSERT INTO dsb86290.P11(employeeID, firstName, lastName, department, salary) VALUES(?, ?, ?, ?, ?)", [employeeID, firstName, lastName, department, salary], (err, data) => {
            conn.close(() => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: 'Employee registered successfully' });
            });
        });
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
