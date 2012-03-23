var ldap = require('ldapjs');
var http = require('http');

var server = ldap.createServer();

// server.search('o=example', function(req, res, next) {
//   var obj = {
//     dn: req.dn.toString(),
//     attributes: {
//       objectclass: ['organization', 'top'],
//       o: 'example'
//     }
//   };

//   if (req.filter.matches(obj.attributes))
//     res.send(obj);

//   res.end();
// });

server.bind('ou=people, dc=mail3, dc=id, dc=iit, dc=edu', function(req, res, next) {
    console.log(req.dn.rdns[0].cn);

    var auth = 'Basic ' + new Buffer(res.dn.toString().split('=', 2)[1] + ':' + req.credentials).toString('base64');

    var options = {
        host: 'localhost',
        port: 8000,
        path: '/httpauth',
        method: 'GET',
        auth: auth
    };

    // auth is: 'Basic VGVzdDoxMjM='
    var httpreq = http.request(options, function(httpresponse) {
        //console.log('STATUS: ' + httpresponse.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(httpresponse.headers));
        
        if(httpresponse.statusCode == 200){
            res.end();
            return next();
        } else {
            return next(new ldap.InvalidCredentialsError());
        }
        httpresponse.setEncoding('utf8');
        httpresponse.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    })

    httpreq.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    httpreq.end();
});

server.listen(1389, function() {
  console.log('LDAP server listening at %s', server.url);
});
