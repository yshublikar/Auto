var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require('./config/config');
var helper = require('./helpers/businessHelper');

var secret = require('./config/secret.js');
var app = express();
var http = require("http");
var url = require("url");
var ejs = require('ejs');
var db;
var session = require('express-session');
var flash = require('express-flash');
var moment = require('moment-timezone');
var json2xls = require('json2xls');

app.use(flash());


/************************* START App initialization & Middlewares ************************************/
/****************************************************************************************************/

//log requests
// app.use(logger('dev'));
app.use(bodyParser.json({ limit: '40mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
// Static folders
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use(express.static('assets'));
app.use(express.static('bower_components'));
app.set('views', __dirname + '/views');
// app.use(express.static(__dirname + '/uploads'));

// Render EJS Templates
app.engine('html', require('ejs').renderFile);

// Express Session config
app.use(session({ secret: 'Secretttttttt', cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, resave: true, saveUninitialized: true })) //Maxage = 7 days

app.use(json2xls.middleware);
// Validate all requests preceded by secure
app.all('/secure/*', require('./middlewares/validateRequest').tokenValidate);

// Globals
global.BASE_URL = config.BASE_URL;
global.API_URL = config.API_URL;
global.moment = moment;
global.changeToVanityurl = helper.changeToVanityurl;
//Set headers for CORS
app.all('/*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');

    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});



// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
// app.all('/api/v1/*', [require('./middlewares/validateRequest')]);
// app.all('/ind-api/*', [require('./middlewares/validateRequest')]);
// app.all('/a/*', [require('./middlewares/validateRequest')]);
// app.get('/validateToken', [require('./middlewares/validateRequest')]);
// app.all('/customer/*', [require('./middlewares/validateCustomerRequest')]);

/************************************************/
/****************** ROUTES **********************/
/************************************************/
app.use('/*', require('./middlewares/validateRequest').sessionValidation);
app.use('/admin/', require('./adminRoutes.js'));
app.use('/', require('./routes.js'));


// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
    var data ={};
    data.title = "404 Error"
    data.page= "404page"
    res.render('page404.html', {data:data, session: req.session });
});


/************************* Start Server & DB *******************************************************/
/***************************************************************************************************/

//Start server
app.set('port', process.env.PORT || config.port);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});


// Database Connection
mongoose.connect(config.mongo.url, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

});