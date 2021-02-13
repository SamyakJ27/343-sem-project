/**
 * @author James Austin Jr.
 * @date 2021/02/07
 * @brief vcsbridge.js permits form data submitted from vcswebsite.html to
 *        be redirected to a special webpage listing out the appropriate data.
 */
const fs = require('fs');
var express = require('express');
var app = express();
    app.use( express.static( './' ));
    app.get(
        '/get_form_text',
        // req - request
        // res - result
        function(req, res) {
            var formText = req.query.my_input_box_text;
            console.log('Form text received: ' + formText);
            res.send('Text Input: ' + formText);
            fs.writeFileSync(__dirname + '/repo.txt', formText, 'utf8');
        }
    );
    app.get(
        '/',
        function(req, res) {
            res.sendFile(
                './vcswebsite.html',
                { root : __dirname }
            );
        }
    );
    app.listen(
        3000,
        function () {
            console.log("vcsbridge.js listening on port 3000!");
        }
    );