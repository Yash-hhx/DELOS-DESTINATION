const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const port = process.env.PORT || 3001;

var mysql = require('mysql');

const app = express();

app.use(cors())
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "localhost",
 user: "root",
 password: "ArsenalMessi@2005",
 database: "transport"
});
 
// make to connection to the database.
con.connect(function(err) {
  if (err) console.log(err)
  // if connection is successful
  
  // Create Through table if it doesn't exist
  con.query(`
    CREATE TABLE IF NOT EXISTS Through (
      RouteID INT NOT NULL CHECK (RouteID > 0),
      DriverID INT NOT NULL CHECK (DriverID > 0),
      StartTime DECIMAL(4,2) CHECK (StartTime >= 0 AND StartTime < 2400),
      BusRegnNo VARCHAR(15) NOT NULL,
      TicketPNR INT NOT NULL CHECK (TicketPNR > 0),
      PRIMARY KEY (RouteID, DriverID, StartTime, TicketPNR),
      FOREIGN KEY (BusRegnNo) REFERENCES BusInfo(BusRegnNo),
      FOREIGN KEY (TicketPNR) REFERENCES Ticket(TicketPNR)
    )
  `, function(err, result) {
    if (err) {
      console.log('Error creating Through table:');
      console.log(err);
    } else {
      console.log('Through table ready');
    }
  });
  
  con.query("select * from UserTable where Name='trimath'", function (err, result, fields) {
    // if any error while executing above query, throw error
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      console.log('ITS OK');
    // if there is no error, you have the fields object
    // iterate for all th
  });
});


app.get('/',(req,res)=>{res.json('avc')});	

app.get('/COST',(req,res)=>{
  con.query("call totalrevenue()", function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key]));
    });
      console.log(resx)
      res.json(JSON.stringify(resx));
  });


})

app.get('/BusStops',(req,res)=>{
  const q = `
    SELECT DISTINCT IntermediateStops AS stop FROM BusStops
    UNION
    SELECT DISTINCT Source AS stop FROM RouteDetails
    UNION
    SELECT DISTINCT Destination AS stop FROM RouteDetails
  `;

  con.query(q, function (err, result, fields) {
    if (err) {
      console.log('error');
      console.log(err);
      return res.json(JSON.stringify([]));
    }

    const resx = result.map(row => row.stop);
    res.json(JSON.stringify(resx));
  });

});	

app.get('/RouteId',(req,res)=>{
  
  con.query("select distinct RouteId from RouteDetails", function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key].RouteId.toString()));
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });


});	

// ✅ Fixed
app.get('/Buses', (req, res) => {
  var from = req.query.from;
  var to = req.query.to;

  var q = `SELECT distinct RouteId FROM BusStops 
           WHERE RouteId IN (
             SELECT RouteId FROM BusStops WHERE IntermediateStops='${from}'
             AND RouteId IN (
               SELECT RouteId FROM BusStops WHERE IntermediateStops='${to}'
             )
           )`;

  con.query(q, function (err, result, fields) {
    if (err) { console.log(err); return res.json({ error: err }); }

    if (result.length >= 1) {
      var resx = result.map(r => r.RouteId);
      res.json(JSON.stringify({ error: '', response: resx }));
    } else {
      res.json(JSON.stringify({ error: 'No route found', response: 'fail' }));
    }})
});

app.get('/Agencies',(req,res)=>{
  
  con.query("select distinct AgencyName from AgencyDetails", function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key].AgencyName.toString()));
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });


}); 


app.get('/fetchBuses/:id',(req,res)=>{
  
  console.log(req.params.id);

  con.query(`select * from BusSchedule natural join BusInfo where RouteID=${req.params.id}`, function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)
      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key]));
      
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });
}); 




app.post('/BookedSeats',(req,res)=>{
  
  var tdate=new Date(req.body.traveldate);
  var bno=req.body.busregnno;
  var dd=tdate.getUTCDate()+1;
  var mm=tdate.getUTCMonth()+1;
  var yyyy=tdate.getUTCFullYear();

var xyz= yyyy+"-"+mm+"-"+dd;
console.log(xyz)
console.log(`select BookedSeats from Ticket natural join SeatsBooked where TravelDate='${xyz}' and BusRegnNo='${bno}'`);
  con.query(`select BookedSeats from Ticket natural join SeatsBooked where TravelDate='${xyz}' and BusRegnNo='${bno}'`, function (err, result, fields) 
  {

      if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key].BookedSeats.toString()));
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });

  
}); 

app.post('/Tickets',(req,res)=>{

var regn=req.body.busregnno;

// Set booking date to today
var bdate = new Date();
var dd_b = bdate.getUTCDate();
var mm_b = bdate.getUTCMonth() + 1;  // Months are 0-indexed
var yyyy_b = bdate.getUTCFullYear();
var bookingDate = yyyy_b + "-" + String(mm_b).padStart(2, '0') + "-" + String(dd_b).padStart(2, '0');

// Parse the travel date provided by user
var tdate = new Date(req.body.traveldate);
var dd_t = tdate.getUTCDate();
var mm_t = tdate.getUTCMonth() + 1;
var yyyy_t = tdate.getUTCFullYear();
var travelDate = yyyy_t + "-" + String(mm_t).padStart(2, '0') + "-" + String(dd_t).padStart(2, '0');

console.log(`insert into Ticket (BusRegnNo,BookingDate,TravelDate) values ('${regn}','${bookingDate}','${travelDate}')`);

con.query(`insert into Ticket (BusRegnNo,BookingDate,TravelDate) values ('${regn}','${bookingDate}','${travelDate}')`, function (err, result, fields) {

  if (err) {
    console.log('error in Ticket');
    console.log(err);
    var abc = {
      pnr: null,
      error: err.message || 'Failed to create ticket. Please ensure TravelDate is at least 3 days from today.'
    };
    res.json(JSON.stringify(abc));
  } 
  else {
    con.query(`select max(TicketPNR) as TicketPNR from Ticket`, function (err, res2, fields) {
      if (err) {
        console.log('error getting PNR');
        console.log(err);
        var abc = {
          pnr: null,
          error: err.message || 'Error retrieving ticket number'
        };
        res.json(JSON.stringify(abc));
      } else {
        var resx = [];
        Object.keys(res2).forEach(function(key) {
          resx.push((res2[key].TicketPNR.toString()));
        });
        console.log('Generated PNR:', resx);
        var abc = {
          pnr: resx,
          error: null
        };
        res.json(JSON.stringify(abc));
      }
    }); 
  }
});
});

app.post('/Through',(req,res)=>{

var rid=req.body.routeid;
var did=req.body.driverid;
var regn=req.body.busregnno;
var pnr=req.body.pnr;
var st=req.body.starttime;

if (!rid || !did || !st || !regn || !pnr) {
    console.log('Missing required fields');
    var abc={
        res:null,
        error:'Missing required fields: routeid, driverid, starttime, busregnno, pnr'
    };
    res.json(JSON.stringify(abc));
    return;
}

console.log(`insert into Through values(${rid},${did},${st},'${regn}',${pnr})`);

con.query(`insert into Through (RouteID, DriverID, StartTime, BusRegnNo, TicketPNR) values(${rid},${did},${st},'${regn}',${pnr})`, function (err, result, fields) {

    if (err) {
        console.log('error in Through');
        console.log(err);
        var abc={
            res:null,
            error:err.message || 'Error inserting into Through table'
        };
        res.json(JSON.stringify(abc));
    }
    else {
        console.log("Insert done");
        var abc={
            res:result,
            error:null
        };
        res.json(JSON.stringify(abc));
    }
});
});



app.post('/SeatsBooking',(req,res)=>{

var pnr=req.body.pnr;
var filled=req.body.seatsbooked;
var f=0;
  for(var i=0;i<filled.length;i++)
  {
  console.log(`insert into SeatsBooked values(${pnr},${filled[i]})`);
  con.query(`insert into SeatsBooked values(${pnr},${filled[i]})`, function (err, result, fields) {

      if (err) 
      {
        f=1;
        console.log('error in SeatsBooked');
        console.log(err)

      }

  });
}
var abc;
 f==1? abc={ res:"",error:"Some error"}: abc={ res:"",error:null}
   res.json(JSON.stringify(abc));

}); 



app.get('/BusRegnNo',(req,res)=>{
  
  con.query("select distinct BusRegnNo from BusInfo", function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key]).BusRegnNo);
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });
});	

app.get('/Drivers',(req,res)=>{
  con.query("select distinct DriverID from DriverDetails", function (err, result, fields) {
    
    if (err) 
      {
        console.log('error');
        console.log(err)

      }
      
    var resx=[];
      Object.keys(result).forEach(function(key) {
      resx.push((result[key]).DriverID.toString());
    });
      console.log(resx);
      res.json(JSON.stringify(resx));
  });


});	


app.post('/login', async (req, res) => {
   

   var user = req.body.email;
   var pass = req.body.password;

var q="select * from UserTable where email='"+user+"' and Password='"+pass+"' and userType='N'"
console.log(q)
 
 	 con.query(q, function (err, result, fields) {
    if (err) console.log(err)
    	if(result.length == 1)
    	{
    		var abc={
    			error:'',
    			response:'success'
    		}
    	}
    	else
    	{
    		var abc={
    			error:'No Such User Exists. Please Register first',
    			response:'fail'
    		}

    	}
    	res.json(JSON.stringify(abc));

  });
    
});

var Id;
app.post('/signup', async (req, res) => {
   
   var email = req.body.email;
   var address = req.body.address;
   var gender = req.body.gender;
   var phone = req.body.phone;
   var user = req.body.username;
   var pass = req.body.pass;
   var gender = "Male";
   var UserType="NA";
   
   console.log(req.body);
con.query("select count(*) as count from UserTable", function (err, result, fields) {
if(err) console.log(err)

    Object.keys(result).forEach(function(key) {
      var res = result[key];
		var	Id=(res.count+1);
			var q= "insert into UserTable (Id, email,Name, Password,UserType) values (?,?,?,?,?);"

			console.log(q);

			con.query(q, [Id,email,user,pass, UserType], function (err, result, fields) {
			if (err) console.log(err)
			
			else
			{
			var q1="insert into NonAdmin (Id, Gender, Phone, Address ) values (?,?,?,?)"
			con.query(q1, [Id, gender, phone, address], function (err, result, fields) {
									const abc={
							  			error:err,
							  			result:result
							  		}
							  		
			});

    		}
		});
});

    const abc={
	  			error:err,
	  			result:result
	  		}
	  		
    res.json(JSON.stringify(abc));	



          });
        
});

app.post('/adminLogin', async (req, res) => {
   
   var user = req.body.username;
   var pass = req.body.password;

var q="select * from UserTable where email='"+user+"' and Password='"+pass+"'"+" and Usertype='A'";
console.log(q)
      con.query(q, function (err, result, fields) {
        if (err) console.log(err)
			

			if(result.length >= 1)
		    	{
		    		var abc={
		    			error:'',
		    			response:'success'
		    		}
		    			
		    
		    	}
		    	else
		    	{
		    		var abc={
		    			error:'No Such User Exists',
		    			response:'fail'
		    		}

		    
		    	}
		    	res.json(JSON.stringify(abc));
		      }

      );
    
    
});

app.post('/CheckRoute', async (req, res) => {
  const fromP = req.body.fromSelect ? req.body.fromSelect.trim() : '';
  const toP = req.body.toSelect ? req.body.toSelect.trim() : '';

  if (!fromP || !toP) {
    return res.json(JSON.stringify({ error: 'No Such Route Exists', response: 'fail' }));
  }

  const q = `
    SELECT DISTINCT RouteId FROM BusStops
    WHERE RouteId IN (
      SELECT RouteId FROM BusStops WHERE LOWER(IntermediateStops)=LOWER(?)
      AND RouteId IN (
        SELECT RouteId FROM BusStops WHERE LOWER(IntermediateStops)=LOWER(?)
      )
    )
  `;

  con.query(q, [fromP, toP], function (err, result, fields) {
    if (err) {
      console.log(err);
      return res.json(JSON.stringify({ error: 'Database error', response: 'fail' }));
    }

    if (result.length >= 1) {
      const resx = result.map(row => row.RouteId);
      return res.json(JSON.stringify({ error: '', response: resx }));
    }

    const fallbackQ = `
      SELECT RouteID FROM RouteDetails
      WHERE LOWER(Source)=LOWER(?) AND LOWER(Destination)=LOWER(?)
    `;

    con.query(fallbackQ, [fromP, toP], function (fallbackErr, fallbackResult) {
      if (fallbackErr) {
        console.log(fallbackErr);
        return res.json(JSON.stringify({ error: 'Database error', response: 'fail' }));
      }

      if (fallbackResult.length >= 1) {
        const resx = fallbackResult.map(row => row.RouteID);
        return res.json(JSON.stringify({ error: '', response: resx }));
      }

      return res.json(JSON.stringify({ error: 'No Such Route Exists', response: 'fail' }));
    });
  });
});


app.post('/busSchedule', async (req, res) => {
  
   	var routeid = req.body.routeid;
    var driverid = req.body.driverid;
    var starttime = req.body.starttime;
    var esttraveltime = req.body.esttraveltime;
    var reservedseats = req.body.reservedseats;
    var busregnno = req.body.busregnno;
	var fare = req.body.fare;

starttime=(starttime/60/60);

     console.log(`insert into BusSchedule (BusRegnNo, RouteID, DriverID, StartTime, fare, ReservedSeats, TravelTime) values (${busregnno},${routeid},${driverid},${starttime},${fare},${reservedseats},${esttraveltime})`);

      con.query("insert into BusSchedule (BusRegnNo, RouteID, DriverID, StartTime, fare, ReservedSeats, TravelTime) values (?,?,?,?,?,?,?);", [busregnno, routeid, driverid, starttime, fare,reservedseats,esttraveltime], function (err, result, fields) {
        if (err) console.log(err);
        if(result.length === 1){
          console.log('Invalid credentials');
        }
        else{
            
          console.log('Successful');
          }
        });

            console.log('Insertion Done into BusSchedule');

	    		var abc={
	    			error:'',
	    			response:''
	    		}

		    	res.json(JSON.stringify(abc));
    
});

app.post('/bus', async (req, res) => {
   
   	var busregno = req.body.busregnno;
	var agencyname = req.body.agencyname;
	var capacity = req.body.capacity;
	var ac = req.body.ac;
	var LocationName=""
	var Latitude=""
	var Longitude=""
	
	console.log(busregno+" "+agencyname+" "+capacity+" "+ac+" "+LocationName+" "+Latitude+" "+Longitude);

	con.query("insert into BusInfo (BusRegnNo, AgencyName, TotalSeats, AC,LocationName,Latitude,Longitude) values (?,?,?,?,?,?,?);", [busregno, agencyname,capacity, ac,LocationName, Latitude,Longitude], function (err, result, fields) {
        if (err) console.log(err);
        if(result.length === 1){
          console.log('Invalid credentials');

        }
        else{
          console.log('Successful');
        }
      });
    
  	    		var abc={
		    			error:'',
		    			response:''
		    		}

		    	console.log(abc);
		    	res.json(JSON.stringify(abc));
    			

});

app.post('/driver', async (req, res) => {
   
   	var driverid = req.body.driverid;
	var drivername = req.body.drivername;
	var driverphone = req.body.driverphone;
  var age=req.body.age;
  var date_of_join = req.body.date_of_join;

console.log(drivername+" "+driverphone+" "+age+" "+date_of_join)

   con.query("insert into DriverDetails (drivername, driverphone, age , date_of_join) values (?,?,?,?);", [drivername, driverphone,age,date_of_join], function (err, result, fields) {
        if (err) console.log(err)
        if(result.length){
          console.log('Successful');
        }
        else{
          console.log('Invalid credentials');
        }
      });
        var abc={
              error:'',
              response:''
            }

          console.log(abc);
          res.json(JSON.stringify(abc));


    });
    
app.post('/', (req, res) => {
  const text = req.body.text;
  console.log("User said:", text);

  // 🔥 TEMP response (you can upgrade later)
  res.json({
    response: "I heard: " + text
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
