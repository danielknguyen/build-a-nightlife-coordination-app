var routes = function(app, flash, util, bcrypt, assert, Yelp) {

  app.get('/', function(req, res) {
    // console.log(res.locals);
    res.render('index.html');
  });

  app.post('/bars', function(req, res) {

    var location = req.body.sIndex;
    // console.log('location: ' + location);
    const client = Yelp.client(process.env.YELP_API_KEY);

    var myPromise = new Promise(function(resolve, reject) {
      // search bars at location
      client.search({
        term: 'Bars',
        location: location,
        limit: 10
      })
      .then(function (data) {
        var businesses = data.jsonBody.businesses;
        // console.log('this is the data: ' + util.inspect(data.jsonBody.businesses));
        for (var i = 0; i < businesses.length; i++) {
          // add a count to each business
          businesses[i].count = (i + 1);
        };
        resolve(businesses);
      })
      .catch(function (err) {
        reject(err);
      });
    });

    myPromise
      .then(function whenOk(response) {
        res.render('index.html', {
          businesses: response
        });
      })
      .catch(function notOk(err) {
        console.log(err);
      });
  });

  app.get('/register', function(req, res) {
    res.render('register.html');
  });

  app.get('/login', function(req, res) {
    res.render('login.html');
  });

}
module.exports = routes;
