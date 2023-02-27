const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require('date-and-time');
const cors = require('cors');


//const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  useUnifiedTopology: true,
  useNewUrlParser: true
  //serverApi: ServerApiVersion.v1
};

//mongoose.connect(uri, options);


const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));


app.options('*', cors());
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT, PATCH, DELETE");
  next();
}); 

/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
 // res.setHeader('Access-Control-Allow-Origin', 'https://sribalajihospital.vercel.app');
  
  

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', "GET, OPTIONS , POST, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
   // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});*/

let port = process.env.PORT || 8080;

const invoiceSchema = mongoose.Schema({

  invoiceNo: String,
  Consultantfee: String,
  Date: { type: Date, default: Date.now },
  Desc: String,
  Price: String,
  Qty: String,
  Total: String,
  amount: String,
  item: String

});


invoiceSchema.statics.bulkInsert = function(models, fn) {
  if (!models || !models.length)
    return fn(null);

  var bulk = this.collection.initializeOrderedBulkOp();
  if (!bulk)
    return fn('bulkInsertModels: MongoDb connection is not yet established');

  var model;
  for (var i = 0; i < models.length; i++) {
    model = models[i];

  // console.log("model :" + models[i].);
    bulk.insert(model.toJSON());
  }

  bulk.execute(fn);
};

const Invoice = mongoose.model("invoices", invoiceSchema);



app.get("/invoice", function(req, res) {
  res.render("invoice");
});

app.options('/saveinvoice', cors());
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
  let saverec = 600;
  date.format((new Date('December 17, 1995 03:24:00')),
    'YYYY/MM/DD HH:mm:ss');
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb+srv://nadeemshaik:nadeem05@cluster0.bbpkwdp.mongodb.net/sribalajihosp", options);
  mongoose.connection.on("open", function(err, conn) {

    var invmodel, models = [];

    //for (var i=0; i<4; i++) 
    for (const key in obj2) {
      console.log("inside For 1" + key);
      for (let i = 0; i < obj2[key].length; i++) {
        invmodel = new Invoice();


        invmodel.invoiceNo = obj2["invoiceInfo"].invoiceNumber;
        invmodel.Consultantfee = obj2["invoiceInfo"].Consultantfee;
        invmodel.Desc = obj2[key][i].name;
        invmodel.Price = obj2[key][i].price;
        invmodel.Qty = obj2[key][i].qty;
        invmodel.amount = obj2[key][i].amount;
       invmodel.Total = obj2["invoiceInfo"].total;
        models.push(invmodel);

      }
    }
    Invoice.bulkInsert(models, function(err, results) {
      if (err) {
        console.log(err);
        return res.status(501).json({status: "err"});
     //   process.exit(1);

      } else {
        console.log(results);
       return res.status(201).json({ status: "ok" });
       // process.exit(0);
      }
    });
  });

});


var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
/*app.listen(3000, function() {
  console.log("App is running on Port 3000");
});*/
