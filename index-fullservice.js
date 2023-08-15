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
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
  next();
}); 



let port = process.env.PORT || 8080;

const invoiceSchema = mongoose.Schema({

  invoiceNo: Number,
  Consultantfee: Number,
  Date: { type: Date, default: Date.now },
  Desc: String,
  Price: Number,
  Qty: Number,
  Total: Number,
  amount: Number,
  itemCode: String,
  customerName : String

});


/* Function */

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

/* End of Function */


const invoiceHeaderSchema = mongoose.Schema({
  invoiceNo: Number,
  Consultantfee: Number,
  Date: { type: Date, default: Date.now },
  Total: Number,
  customerName : String

});

const Invoice = mongoose.model("pharmainvoices", invoiceSchema);
const invoiceHeadermodel = mongoose.model("invoiceheader", invoiceHeaderSchema);






//const invoiceHeadermodel = mongoose.model("pharmainvoices", invoiceSchema);




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
 // mongoose.connect("mongodb+srv://nadeemshaik:nadeem05@cluster0.bbpkwdp.mongodb.net/sribalajihosp", options);
 mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);

 mongoose.connection.once("open", function(err, conn) {

    var invmodel, models = [];

    //for (var i=0; i<4; i++) 
    for (const key in obj2) {
      console.log("inside For 1" + key);
      for (let i = 0; i < obj2[key].length; i++) {
        invmodel = new Invoice();


        invmodel.invoiceNo = Number(obj2["invoiceInfo"].invoiceNumber);
        invmodel.Consultantfee = Number(obj2["invoiceInfo"].consultantfee);
        invmodel.Desc = obj2[key][i].name;
        invmodel.Price = Number(obj2[key][i].price);
        invmodel.Qty = Number(obj2[key][i].qty);
        invmodel.amount = Number(obj2[key][i].price) * Number(obj2[key][i].qty);
       invmodel.Total = Number(obj2["invoiceInfo"].total);
       invmodel.customerName = obj2["invoiceInfo"].customerName;
        models.push(invmodel);

      }
    }
    var invoicehead = new invoiceHeadermodel({ 
      invoiceNo: Number(obj2["invoiceInfo"].invoiceNumber), 
      Consultantfee: Number(obj2["invoiceInfo"].consultantfee), 
      Total: Number(obj2["invoiceInfo"].total)});
 
    // save model to database
    invoicehead.save(function (err, book) {
      if (err) return console.error(err);
      console.log(book.invoiceNo + " saved to  collection.");
    });

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
  setTimeout( function () {
    mongoose.connection.close();
  }, 1000);
});


/* GET service Based on Date */



app.get("/invoice", function(req, res) {
  res.render("invoice");
});

app.get("/invoices/:stdate",  function(req, res, next) 
{
  let user;
  var mdate = new Date();
 // console.log(req.params.stdate + " Stdate");
//  mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));
 // mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));

  
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);
  
  //mongoose.Connection.once
  mongoose.connection.once("open", function(err, conn) {
   
   invoiceHeadermodel.find({ 
    Date: {
          $gte: new Date(new Date(mdate))
          /** --$lt: new Date(new Date(endDate).setHours(23, 59, 59)) */
           }
    }).sort({ Date: 'asc'})  
    .then(invoiceHeadermodel => {       
       if(!invoiceHeadermodel) {       
          res.status(404).send();      
       }
       
      // res.send(JSON.stringify(invoicemodel));
       res.end(JSON.stringify(invoicemodel));
       console.log(JSON.stringify(invoicemodel));
     }).catch((e) => {      
        res.status(400).send(e);    
     });
});

});

/* End of */

/** Delete Service */

app.get('/delinvoice/:stinvoice',  function(req, res, next) 
{
  let minvoice = mongoose.Types.ObjectId(req.params.stinvoice);
  
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);
  console.log("in Delete" + minvoice);
  //mongoose.Connection.once
  mongoose.connection.once("open", function(err, conn) {
   
     invoiceHeadermodel.findByIdAndDelete(minvoice).then((tid) => {
        if (!tid) {
            return res.status(404).send();
        }
        res.send(tid);
        mongoose.connection.close();
        /**
         * const query = { "reviews": { "$size": 0 } };

itemsCollection.deleteMany(query)
  .then(result => console.log(`Deleted ${result.deletedCount} item(s).`))
  .catch(err => console.error(`Delete failed with error: ${err}`))
         */
        res.end();
    }).catch((error) => {
      console.log("Error Msg:" + error);
        res.status(500).send(error);
    })
   
  
});
  //
});

/*** End of Delete service */


/* GET service Based on Invoice number */

app.get("/getinvoice/:stinvoice",  function(req, res, next) 
{
  let minvoice = req.params.stinvoice;
  
 // console.log(req.params.stdate + " Stdate");
//  mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));
 // mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));

  
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);
  
  //mongoose.Connection.once
  mongoose.connection.once("open", function(err, conn) {
   
    Invoice.find({'invoiceNo': minvoice})  
    .then(Invoice => {       
       if(!Invoice) {       
          res.status(404).send();      
       }
       
      // res.send(JSON.stringify(invoicemodel));
       res.end(JSON.stringify(Invoice));
       console.log(JSON.stringify(Invoice));
     }).catch((e) => {      
        
      res.status(400).send(e);    
     });
});

});

/* End of */

/* GET service for all invoices */

app.get("/getinvoicesall/",  function(req, res, next) 
{
 
  var mdate = new Date();
 // console.log(req.params.stdate + " Stdate");
  const yesterday = (d => new Date(d.setDate
    (d.getDate())).toISOString().split("T")[0])(new Date());
//  mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));
  console.log(mdate + " Stdate");
  mdate.setDate(mdate.getDate()-90);
    console.log("New Date " +  mdate + " Search");
 // console.log(mdate + " Stdate");
//  mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));
 // mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));

  
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);
  mongoose.set('bufferCommands', false);
  //mongoose.Connection.once
  mongoose.connection.once("open", function(err, conn) {

    Invoice.aggregate([{ 
      $lookup: {
       from: 'invoiceheaders',
       let: {invoiceNo: '$invoiceNo'},
       pipeline: [{$match: {
        $expr: {
         $eq: [
          '$invoiceNo', '$$invoiceNo'
         ]
        }}}, {
          $limit: 1
        }],
        as: 'detailinfo',
      }},{ 
        $unwind: '$detailinfo'
       }]).exec(function(err, detailinfo) {
    res.end(JSON.stringify(detailinfo));
    console.log(JSON.stringify(detailinfo));
    mongoose.connection.close();
  });
   
   
});

});

/* End of */



/* GET service Based on Date */

app.get("/getinvoices/main/",  function(req, res, next) 
{
  let user;
  var mdate = new Date();
 // console.log(req.params.stdate + " Stdate");
  const yesterday = (d => new Date(d.setDate
    (d.getDate())).toISOString().split("T")[0])(new Date());
//  mdate.setDate(mdate.getDate() - parseInt(req.params.stdate));
  mdate.setDate(mdate.getDate()-90);
 // console.log("HHH");
console.log(mdate);
  
  mongoose.set('strictQuery', false);
  mongoose.connect("mongodb://localhost:27017/sribalajihosp", options);
  mongoose.set('bufferCommands', false);
  //mongoose.Connection.once
  mongoose.connection.once("open", function(err, conn) {
   // invoicemodel.find({})
   invoiceHeadermodel.find({ 
    Date: {
         $gte: new Date(mdate)
         // $lt: new Date(new Date().setHours(23, 59, 59))
           }
    }).sort({ Date: 'asc'})  
    .then(invoiceHeadermodel => {       
       if(!invoiceHeadermodel) {       
          res.status(404).send();      
       }
       
      // res.send(JSON.stringify(invoicemodel));
       res.end(JSON.stringify(invoiceHeadermodel));
       console.log(JSON.stringify(invoiceHeadermodel));
       mongoose.connection.close();

     }).catch((e) => {      
        res.status(400).send(e);    
     });
});

});

/* End of */


var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
/*app.listen(3000, function() {
  console.log("App is running on Port 3000");
});*/