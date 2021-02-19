/**
 * @author James Austin Jr., Rifat Hasan, Rishika Baranwal, Samyak Jain
 * @email james.austin@student.csulb.edu, rifat.hasan@student.csulb.edu, rishika.baranwal@student.csulb.edu, samyak.jain@student.csulb.edu
 * @date 2021/02/07
 * @brief vcsbridge.js permits form data submitted from vcswebsite.html to
 *        be redirected to a special webpage listing out the appropriate data.
 */

var fse = require('fs-extra');
var fs = require('fs');
var express = require('express');
var app = express();
    app.use( express.static( './' ));
    app.get(
        '/get_repo_form',
        // req - request
        // res - result
        function(req, res) {
            var fileName = req.query.repo_name;
            var sourcePath = req.query.source_path;
            var targetPath = req.query.target_path;
            console.log('Repo Name recieved: ' + fileName);
            console.log('Source Path recieved: ' + sourcePath);
            console.log('Target Path received: ' + targetPath)
            res.send('You can find ' + fileName + ' repo at ' + sourcePath + '.txt');
            fse.copy(sourcePath, targetPath, () => {console.log("\nFile successfully stored!\n")});
            // ! for filename switch slashes to '/' not '\'
            // * filepath example: C:\Users\rifat\projects
            //fs.writeFileSync(sourcePath + '/' + fileName + '.txt', targetPath, 'utf8'); //concatenates filepath given and repo name to create text file in user's desired location
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

/**
 * Artifact ID Generator
 * Generates a filename according to file data passed in through form
 */
/*
 function artID() {
    var rootName = __dirname; // A - root name // fs.dir.path? // need to change path name to respective file
    var fileData = fs.readFileSync(rootName + '/repo.txt', 'utf8'); // repo.txt needs to change
    var fileLength = fileData.length();

    // needs to be changed to respective file
    var D = 'repo';
    var E = 'txt';

    var iter = 0;
    var hexTotal = 0;
    var iterTracker = 4;
    var r = 0;
    while (!fileData) { // idk how to check for EOF
        // iter++;
        r = ++iter % iterTracker;
        if (r == 0) {
            hexTotal += fileData.charAt(iter) * 3;
        }
        else if (r == 1 || r == 3) {
            hexTotal += fileData.charAt(iter) * 7;
        }
        else if (r == 2) {
            hexTotal += fileData.charAt(iter) * 11;
        }
    }
    var C = hexTotal.toString(16); // C - hex output, needs to be truncated for overflow

    function hexConvert (text) {
        var hex = '';
        for (var i = 0; i < text.length; ++i) {
            hex += text.charAt(i).toString(16);
        }
        return hex;
    }

    var A = hexConvert(rootName); // A - hex output
    var B = hexConvert(fileLength); // B - hex output

    console.log('' + A + '/' + B + '/' + C + '/' + D + '.' + E);
}
*/