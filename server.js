var express = require('express'),
    dotenv = require('dotenv').config(),
    engines = require('consolidate'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    util = require('util'),
    bcrypt = require('bcrypt-nodejs'),
    assert = require('assert');
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    app = express(),
    session = require('express-session'),
    db = require('./config/db.js');
    MongoStore = require('connect-mongo')(session);

var appConfig = function() {
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.engine('html', engines.nunjucks);
  // extended allows parsing nested objects
  app.use(bodyParser.urlencoded( { extended: true }));
  app.use(bodyParser.json());
  // middleware to log each req/res
  app.use(morgan('dev'));
  app.use(cookieParser(process.env.COOKIE_KEY));
  app.use(session({
    secret: process.env.SESSION_KEY,
    // if set to true lets the session store know that the user is still active and will still update the database even if session was unchanged to prevent session store being deleted from idle(unused)
    resave: true,
    // if set to false, will not create a new session
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db.connection,
      // 1 day in seconds
      ttl: 86400,
      autoRemove: 'native'
    }),
    cookie: {
      secure: false,
      // 5min in milli
      maxAge: 300000
     }
  }));
  app.use(flash());
  // custom flash middleware
  app.use(function(req, res, next) {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  });
}();
var routes = require('./routes/routes.js')(app, flash, util, bcrypt, assert);
var port = process.env.PORT || 5000;
var server = app.listen(port, function() {
  console.log("Express server is listening on port %s.", port);
});
