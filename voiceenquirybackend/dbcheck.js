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
  const queries = [
    { q: 'SELECT * FROM RouteDetails WHERE LOWER(Source)=LOWER(?) AND LOWER(Destination)=LOWER(?)', params: ['Bangalore', 'Chennai'] },
    { q: 'SELECT * FROM BusStops WHERE LOWER(IntermediateStops)=LOWER(?)', params: ['Bangalore'] },
    { q: 'SELECT * FROM BusStops WHERE LOWER(IntermediateStops)=LOWER(?)', params: ['Chennai'] },
    { q: 'SELECT * FROM BusSchedule WHERE RouteID=?', params: [1] }
  ];
  const run = i => {
    if (i >= queries.length) {
      con.end(() => process.exit(0));
      return;
    }
    con.query(queries[i].q, queries[i].params, (err, res) => {
      if (err) {
        console.error('err', err);
        process.exit(1);
      }
      console.log('QUERY' + i, JSON.stringify(res));
      run(i + 1);
    });
  };
  run(0);
});
