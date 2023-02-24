const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require('date-and-time');
import cors from 'cors';


mongoose.connect("mongodb+srv://nadeemshaik:nadeem05@cluster0.bbpkwdp.mongodb.net/sribalajihosp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
  date.format((new Date('December 17, 1995 03:24:00')),
  'YYYY/MM/DD HH:mm:ss');

  for (const key in obj2) {
    for (let i = 0; i < obj2[key].length; i++) {
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
        if (err) res.status(500).send(err);

      });

    }

  }

  res.status(201).send("ok");

});


var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
app.listen(3000, function() {
  console.log("App is running on Port 3000");
});
