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
var date = new Date();
var counter = 0;
// only need if hidden files become a problem
// const fs = require('fs').promises;

var app = express();
const path = require('path');
const { connect } = require('http2');
app.use(express.static('./'));
app.get(
    '/get_repo_form',
    // req - request
    // res - result
    function(req, res) {
        var repoName = req.query.repo_name; // ! something
        var sourcePath = req.query.source_path; // ! C:/Users/rifat/Desktop/source
        var targetPath = req.query.target_path + '/' + repoName; // ! C:/Users/rifat/Desktop/CSULB-2021-Spring/target
        // var targetPath = req.query.target_path;
        var base = path.basename(sourcePath); // ? something bc we add folder called 'something' to the end

        console.log('Repo Name recieved: ' + repoName);
        console.log('Source Path recieved: ' + sourcePath);
        console.log('Target Path received: ' + targetPath);
        console.log('Base Name: ' + base);

        if (!fs.existsSync(targetPath))
            fs.mkdirSync(targetPath);

        counter++;
        manifest(sourcePath, targetPath);
        // labelName = null;
        // manifest(sourcePath, targetPath, labelName);
        fileList(sourcePath, targetPath, sourcePath);

        // Label File
        let l = targetPath + "/.labels.txt"
        fs.appendFile(l, "manifest" + counter + " - \n", (err) => { console.log(err); });

        // Error Handling for existing directories
        // if (!fs.existsSync(targetPath + '/' + repoName)) {
        //     fs.mkdirSync(targetPath + '/' + repoName);
        //     targetPath = targetPath + '/' + repoName;
        // }

        res.send('You can find ' + repoName + ' repo at ' + targetPath);

        // ! for filename switch slashes to '/' not '\'
        // * filepath example: C:\Users\rifat\projects
    }
);

/**
 * Triggered by Check In button
 */
app.get(
    '/get_checkin_form',
    function(req, res) {
        // var labelName = req.query.label_name;
        var sourcePath = req.query.source_path;
        var targetPath = req.query.target_path;
        if (!fs.existsSync(targetPath)) {
            res.send(targetPath + " does not exist");
        } else {
            counter++;
            // manifest(sourcePath, targetPath, labelName);
            manifest(sourcePath, targetPath);
            fileList(sourcePath, targetPath, sourcePath);
            // Label File
            let l = targetPath + "/.labels.txt"
            fs.appendFile(l, "manifest" + counter + " - \n", (err) => { console.log(err); });
            res.send('You can find your changes at ' + targetPath);
        }
    }
);

/**
 * Triggered by Label button
 */
app.get( // may use different names
    '/get_label_form',
    function(req, res) {
        var targetPath = req.query.target_path; // includes manifest file name
        // var manifestName = req.query.mani_name;   // manifest1.txt
        var labelName = req.query.label_name;
        labelFile(targetPath, labelName);
    }
);

/* function getCurrentFilenames() { 
    console.log("\nCurrent filenames:"); 
    fs.readdirSync(__dirname).forEach(file => { 
      console.log(file); 
    }); 
  }  */
app.get(
    '/get_listing_form',
    function(req, res) {
        console.log("RUNNING listing_form");
        //const data = fs.readFileSync('inputSourcePathHere', {encoding: 'utf-8', flag:'r'}); 
        // ! put source folder in string so that we can print out all files in that folder
        // ! have user input the folder path

        let repoPath = req.query.repo_path;
        console.log(repoPath);
        var labeltxtPath = path.join(repoPath, '/.labels.txt');
        console.log(labeltxtPath)

        var arrayOfLabels = fs.readFileSync(labeltxtPath, 'utf-8');
        console.log(arrayOfLabels);
        res.send("List of Labels" + arrayOfLabels);
    }
);


app.get(
    '/',
    function(req, res) {
        res.sendFile(
            './vcswebsite.html', { root: __dirname }
        );
    }
);

app.listen(
    3000,
    function() {
        console.log("vcsbridge.js listening on port 3000!");
    }
);

function labelFile(targetPath, labelName) {
    console.log("RUNNING labelFile");
    // let labeltxt = targetPath + '/.labels.txt'

    // this is for mac or windows users 
    let slashMarker = targetPath.lastIndexOf('/')
    if (slashMarker < 0) {
        slashMarker = targetPath.lastIndexOf('\\');
    }
    let manifestFile = targetPath.substr(slashMarker + 1);
    targetPath = targetPath.substr(0, slashMarker);
    console.log(manifestFile);

    dotMarker = manifestFile.lastIndexOf('.') - 1;
    let manifestName = manifestFile.substr(1, dotMarker);
    let labeltxt = targetPath.replace(targetPath, targetPath + '/.labels.txt');
    console.log("MN", manifestName)
        // list labels
        // fs.appendFileSync(labeltxt, manifestName + " - " + labelName);

    // inline labels
    fs.readFile(labeltxt, 'utf8', (err, content) => {
        if (err) { console.log(err); return err; }

        if (content.includes(manifestName)) {
            //stuff i wrote
            // let re = new RegExp('^.*' + manifestName + '.*$', 'gm'); //basically it searches the line and sees if the manifest name is in hte middle and it 
            // let oldre = re;
            // let formatted = content.replace(re, re + ", " + labelName); //re += ", " + labelName; //makes the 
            // content.replace(oldre, re);

            // let lastMark = content.lastIndexOf("|");
            let manNumber = manifestName.indexOf("t") + 1;

            // console.log("M#", manNumber);
            // console.log("MN", manifestName);
            // console.log(manifestName.substr(manNumber));
            // console.log("N#", (parseInt(manifestName.charAt(manNumber)) + 1).toString());

            let nextManifest = manifestName.substr(0, manNumber) + (parseInt(manifestName.charAt(manNumber)) + 1).toString();

            console.log("NM", nextManifest);
            let content1 = content.substr(0, content.indexOf(manifestName));
            let content2 = content.substr(content.indexOf(nextManifest));
            let substringManifest = content.substr(content.indexOf(manifestName), content.indexOf(nextManifest) - 1);
            substringManifest += " " + labelName + "\n";
            if (content.indexOf(nextManifest) == -1) {
                content2 = content.substr(content.lastIndexOf(" "))
                substringManifest = content.substr(content.indexOf(manifestName));
                substringManifest += " " + labelName + "\n";
            }

            // console.log(content2);
            // console.log(content.indexOf(nextManifest))

            content = content1 + substringManifest + content2;

            console.log(content);

            fs.writeFile(labeltxt, content, 'utf8', function(err) {
                if (err) return console.log(err);
            });
            //stuff i wrote ended 
            // fs.writeFile(labeltxt,  + " " + labelName + " |", 'utf8', (err) => {
            //     if(err) { console.log(err); return err; }
            // });
        } else {
            fs.appendFileSync(labeltxt, "\n" + manifestName + " - " + labelName);
        }
    });
}

// function manifest(sourcePath, targetPath, labelName) {
function manifest(sourcePath, targetPath) {
    let a = targetPath + "/.manifest" + counter + ".txt";
    var time = new Date(); //toISOString().replace(/T/, ' ').replace(/\..+/, '') + "\n";
    let year = time.getFullYear();
    let day = time.getDate();
    let month = time.getMonth() + 1;
    let hour = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    let timestamp = year + "-" + day + "-" + month + " " + hour + ":" + minutes + ":" + seconds + "\n";

    let commandLine = "create " + sourcePath + " " + targetPath + "\n";
    fs.appendFile(a, commandLine, function(err) {
        if (err) throw err;

    });
    fs.appendFile(a, timestamp, function(err) {
        if (err)
            throw err;
        console.log("added timestamp");
    });
}

// function fileList(filePath, targetPath) {
function fileList(filePath, targetPath, ogsourcePath) {
    let filenames = fs.readdirSync(filePath);
    for (let i = 0; i < filenames.length; ++i) {
        // removes dot files from list
        if (filenames[i].charAt(0) == '.' && !(filenames[i].includes('.manifest'))) { // prevents manifest dot files from being deleted
            console.log("Removing - " + filenames[i]);
            fs.unlinkSync(path.join(filePath, filenames[i]));
            // console.log(fs.readFileSync(filenames[i], 'utf8'));
            filenames.splice(i, 1);
        }
    }
    filenames.forEach(file => {
        let temp = filePath;
        filePath = path.join(filePath, file); // change filePath to base
        // debug
        // console.log('File Path:', filePath)
        // var content; // contents inside the file
        if (fse.lstatSync(filePath).isFile()) {
            var content = fs.readFileSync(filePath, 'utf8');
            // artID(filePath, content, targetPath, file);
            artID(filePath, content, targetPath, file, ogsourcePath);
            filePath = temp;
        } else {
            // fileList(filePath, targetPath); // recursion for any folders
            fileList(filePath, targetPath, ogsourcePath);
            filePath = temp;
        }
    });
}

/**
 * Artifact ID Generator
 * Generates a filename according to file data passed in through form
 */
// function artID(filePath, content, targetPath, file) {
function artID(filePath, content, targetPath, file, ogsourcePath) {
    var hashOffset = 4;
    var r = 0; // remainder
    var hexTotal = 0;

    // debug
    // console.log("FilePath:", filePath);
    for (let iter = 0; iter < content.length; ++iter) {
        // r = iter % hashOffset;
        r = iter % hashOffset;
        if (r == 0) {
            hexTotal += content.charCodeAt(iter) * 3;
        } else if (r == 1 || r == 3) {
            hexTotal += content.charCodeAt(iter) * 7;
        } else if (r == 2) {
            hexTotal += content.charCodeAt(iter) * 11;
        }
    }
    var pathHex = 0;
    // does not calculate/truncate for relative path
    // filePath is not the relative source project tree path
    for (let f = 0; f < filePath.length; ++f) {
        pathHex += filePath.charCodeAt(f);
    }
    var A = pathHex.toString(16);
    A = A.substr(A.length - 2, A.length); // truncates hex digits
    var B = fs.statSync(filePath).size.toString(16); // is size the same as file length?
    while (B.length < 4)
        B = '0' + B;
    var C = hexTotal.toString(16);
    while (C.length < 4)
        C = '0' + C;
    let artifactName = A + '-' + B + '-' + C + '-' + file;
    // let name = targetPath + '/' + A + '-' + B + '-' + C + '-' + file;
    let name = targetPath + '/' + artifactName;
    let slashMarker = filePath.lastIndexOf('/'); //windows require the \\ while the mac requires a / 
    // let tempName = filePath.substr(0, slashMarker) + '/' + A + '-' + B + '-' + C + '-' + file;
    if (slashMarker < 0) { //this is for mac or windows users 
        slashMarker = filePath.lastIndexOf('\\');
    }
    let tempName = filePath.substr(0, slashMarker) + '/' + artifactName;

    // debug
    // console.log("Hex Total:", hexTotal, "C: ", C);
    // console.log('FP:', filePath);
    // console.log('TN:', tempName);
    // console.log('TP:', targetPath);
    // console.log('F:', file);
    // console.log('N:', name);
    // if(fs.exists(tempName, (err) => { if(err) { console.log(err); } console.log('TempName Exists...'); }));
    // if(fs.exists(targetPath, (err) => { if(err) { console.log(err); } console.log('Target Exists...'); }));
    // if(fs.exists(name, (err) => { if(err) { console.log(err); } console.log('Name Exists...'); }));

    fs.copyFile(filePath, tempName, fs.constants.COPYFILE_FICLONE, function(err) {
        if (err) { console.log(err); }
        // NOTE: causes error if file already exists, should use fs.exists() to check for error
        fse.move(tempName, name, (err) => { console.log(err); });
    });

    /********/
    let extralen = filePath.length - ogsourcePath.length - file.length;
    var sub = filePath.substr(ogsourcePath.length, extralen); //could be length-1 might have to double check on that possible point of error here 
    // debug
    // console.log(sub);
    // console.log(extralen);

    // adds artifactName to manifest file
    let a = targetPath + "/.manifest" + counter + ".txt";
    // debug
    console.log(artifactName + " @ " + sub + "\n");
    fs.appendFile(a, artifactName + " @ " + sub + "\n", function(err) {
        if (err) throw err;
        console.log("added " + file);
        console.log(artifactName + " @ " + sub);
    });
    /********/

    // debug
    // console.log('Art ID: A:' + A + '/B:' + B + '-C:' + C + '-F:' + file);

}