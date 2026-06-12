const mysql = require('mysql');
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ArsenalMessi@2005',
  database: 'transport'
});
con.connect(err => {
  if (err) {
    console.error('connect err', err);
    process.exit(1);
  }

  const stmts = [
    "INSERT IGNORE INTO usertable (ID, Email, Name, Password, Usertype) VALUES (1, 'admin@example.com', 'Admin User', 'password', 'A')",
    "INSERT IGNORE INTO admin (ID, AgencyName, AgencyPhone, AgencyOffice) VALUES (1, 'Sample Agency', '1234567890', 'Sample Office')",
    "INSERT IGNORE INTO businfo (BusRegnNo, AgencyName, TotalSeats, AC, LocationName, Latitude, Longitude) VALUES ('BUS001', 'Sample Agency', 40, 1, 'Bangalore', 12.9716, 77.5946)",
    "INSERT IGNORE INTO driverdetails (DriverID, DriverName, DriverPhone, Age, Date_Of_Join) VALUES (1, 'Driver One', 9876543210, 35, '2020-01-01')",
    "INSERT IGNORE INTO busschedule (BusRegnNo, RouteID, DriverID, StartTime, Fare, ReservedSeats, TravelTime) VALUES ('BUS001', 1, 1, 9.00, 500, 0, 6.5)",
    "INSERT IGNORE INTO busstops (RouteID, IntermediateStops, StopNumber) VALUES (1, 'Bangalore', 1)",
    "INSERT IGNORE INTO busstops (RouteID, IntermediateStops, StopNumber) VALUES (1, 'Chennai', 2)"
  ];

  const run = i => {
    if (i >= stmts.length) {
      console.log('Seed complete');
      con.end(() => process.exit(0));
      return;
    }
    con.query(stmts[i], (err, res) => {
      if (err) {
        console.error('stmt error', stmts[i], err);
      } else {
        console.log('stmt ok', stmts[i], 'affectedRows=', res.affectedRows, 'warningCount=', res.warningCount);
      }
      run(i + 1);
    });
  };
  run(0);
});
