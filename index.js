const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect("mongodb+srv://nadeemshaik:nadeem05@cluster0.bbpkwdp.mongodb.net/sribalajihosp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const invoiceSchema = {

  invoiceNo: String,
  Consultantfee: String,
  Date: String,
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
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded());

app.use(express.static(__dirname + '/public'));

app.get("/invoice", function(req, res) {
  res.render("invoice");
});

app.post("/saveinvoice", function(req, res) {
  // console.log(req.body.invoiceNo);
  // let obj2 = JSON.stringify(req.body[1]);

  //req.body = {};

  console.log(req.headers);

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
  console.log("dumping 1 ");
  //let obj2 = JSON.parse(JSON.stringify(req.body));
  let obj2 = req.body;

  const keys = Object.keys(obj2);

  //console.log(JSON.stringify(obj2));

  //keys.forEach((key, index) => {
   // console.log(`${key}: ${obj2[key]}`);
 // });
  console.log("dumping 2");
 // Object.values(obj2).forEach(val => console.log(val));
  //console.log(obj2[0]);
  // console.log(obj2.Items[0].name);
  console.log("dumping");
  //for (const key in res.body["Invoice"]) {  
  for (const key in obj2) {
    if (key === 'Invoice') {
      console.log(`K ${key}: ${obj2[key].total}`)
      console.log(`K ${key}: ${obj2[key].consultantfee}`)
    }
    if (key === 'Items') {
      console.log("It...")
      console.log(`K ${key}: ${obj2[key][0].name}`)
      //console.log(`K ${key}: ${obj2[key].consultantfee}`)
    }
    console.log("--");
  }
  // console.log(req.body["Invoice"].invoiceNumber);
  //} 
  const invoice = new Invoice({
    invoiceNo: req.body.invoiceNo,
    Consultantfee: req.body.Consultantfee,
    Date: req.body.Date,
    Desc: req.body.Desc,
    Price: req.body.email,
    Qty: req.body.Qty,
    Total: req.body.Total,
    amount: req.body.amount,
    item: req.body.item
  });
  res.status(201).send("ok");
  /*invoice.save(function(err, doc) {
    if (err) res.status(500).send(err);
    res.status(201).send(invoice);
  });*/
});

app.listen(3000, function() {
  console.log("App is running on Port 3000");
});
