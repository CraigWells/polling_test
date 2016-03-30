// modules =================================================
var express        = require('express');
var app            = express();
// configuration ===========================================

// set our port
var port = process.env.PORT || 8081; 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/www')); 

// routes ==================================================
app.get('*', function(req, res) {
    res.sendFile(__dirname +'/www/index.html'); // load our public/index.html file

});

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Magic happens on port ' + port);