'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();
var bodyParser = require('body-parser');
var dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


//My code
var shortensArr = [];

app.post("/api/shorturl/new", function (req, res) {
  var url = req.body.url;
  var urlRegEx = url.replace(/(www.|https?:\/\/)/ig, '');
  
  dns.lookup(urlRegEx, (err, address, family) => { if(err || !address) {
    res.json({"error":"site '" + url + "' does not exist"});
  } else {
    
    var shortened = {"original_url": url, "short_url":shortensArr.length+1};
    var find = shortensArr.find((item) => item.original_url === url);
    
    if(find === undefined) {
      shortensArr.push(shortened);
      res.json(shortened);
    } else {
      res.json(find);
    }
    
  }});
});

app.get("/api/shorturl/all", function (req, res) {
  // res.json(shortensArr);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(shortensArr, null, 4));
});

//API redirect
app.get("/api/shorturl/:number", function (req, res) {
  var reqParam = req.params.number;
  var find = shortensArr.find((item) => item.short_url == reqParam);
  
  if(find === undefined) {
    res.json({"error": "short URL not found"});
  } else {
    res.redirect(find.original_url);
  }
});

app.all('*', function(req, res) {
  throw new Error("Bad request");
});

app.use(function(e, req, res, next) {
  if (e.message === "Bad request") {
    res.status(400).json({"error":"invalid URL"});
  }
});



app.listen(port, function () {
  console.log('Node.js listening ...');
});