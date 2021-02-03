// File: app.js
// Time-stamp: <2020-09-02 12:56:17 Chuck Siska>

var express = require('express');
var app = express();  // Init an Express object.
    app.use( express.static( './' )); //Avoid 'MIME type ("text/html") mismatch'
    app.get( // Handle a client-side action request.
        '/get_form_text', // For this URL sub-tag action:
        function(req, res){  // Run this fcn.
        // Get the text from the URL request packet.
        var myText = req.query.my_input_box_text;
        console.log('App.js rcvd = ' + myText + '.');
        // Reply to the client GUI using that text.
        res.send('Your Text:' +myText); 
    }); 
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    //OBE res.send('Hello World!'); // Send webpage containing "Hello World!".
    // NB, need absolute path here (including correct drive location).
    res.sendFile( 'D://csu//assets//js-node//myapp//js-1-edt.html' ); 
});
app.listen(3000, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port 3000!');

});
