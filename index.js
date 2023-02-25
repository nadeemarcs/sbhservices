const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require('date-and-time');
import cors from 'cors';


const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

//mongoose.connect(uri, options);


mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://nadeemshaik:nadeem05@cluster0.bbpkwdp.mongodb.net/sribalajihosp", options);

let port = process.env.PORT || 8080;

const invoiceSchema = {

  invoiceNo: String,
  Consultantfee: String,
  Date: {type: Date, default: Date.now},
  Desc: String,
  Price: String,
  Qty: String,
  Total: String,
  amount: String,
  item: String

};

const Invoice = mongoose.model("invoices", invoiceSchema);

const app = express();

//app.set("view engine", "ejs");

/*app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());*/
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded());

app.use(express.static(__dirname + '/public'));

app.get("/invoice", function(req, res) {
  res.render("invoice");
});

app.post("/saveinvoice", function(req, res) {
const dtvalue = date.format((new Date(mongoose.now)),
  'DD/MM/YYYY HH:mm:ss');

  if (req.headers['content-type'] === 'application/json') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
      } catch (error) {
        // Ignore the error
      }
    });
  }


  let obj2 = req.body;
  let saverec=0;
  date.format((new Date('December 17, 1995 03:24:00')),
  'YYYY/MM/DD HH:mm:ss');
console.log("inside .... about to enter ");
  for (const key in obj2) {
    console.log("inside 1");
    for (let i = 0; i < obj2[key].length; i++) {
      console.log("inside 2");
      const invoice = new Invoice({
        invoiceNo: obj2["Invoice"].invoiceNumber,
        Consultantfee: obj2["Invoice"].Consultantfee,
      //  Date: new ISODate(),
        Desc: obj2[key][i].name,
        Price: obj2[key][i].price,
        Qty: obj2[key][i].Qty,
        Total: obj2["Invoice"].total,
        amount: obj2[key][i].amount,
        
      })
      invoice.save(function(err, doc) {
       // if (err) res.status(500).send(err);
        if(err) return res.status(501).json({})
        saverec=i;
      });

    }

  }

 if (saverec <> 0) res.status(201).send("ok");

});


var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
/*app.listen(3000, function() {
  console.log("App is running on Port 3000");
});*/
