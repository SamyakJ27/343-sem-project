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
const path = require('path');
app.use(express.static('./'));

// NOTE: value does not retain previous values from previous programs
/** @param {int} manifest_num - Global manifest number for manifest file ordering */
var manifest_num = 0;

app.get(
    '/get_mergeout_text',
    function(req,res) {

    }
);

app.get(
    '/get_mergein_text',
    function(req,res) {

    }
);

/**
 * Create Repo
 */
app.get(
    '/get_repo_form',   // locates the create repo button in the HTML file
    // req - request
    // res - result
    function(req, res) {
        // Text box information
        var repoName = req.query.repo_name; // ! something
        var sourcePath = req.query.source_path; // ! C:/Users/rifat/Desktop/source
        var targetPath = req.query.target_path + '/' + repoName; // ! C:/Users/rifat/Desktop/CSULB-2021-Spring/target
        
        // debug
        console.log('Repo Name recieved: ' + repoName);
        console.log('Source Path recieved: ' + sourcePath);
        console.log('Target Path received: ' + targetPath);

        // Creates new directory if target directory does not exist
        if (!fs.existsSync(targetPath))
            fs.mkdirSync(targetPath);

        // Increment global manifest counter, runs manifest function, transfer files
        manifest_num++;
        build_manifest(sourcePath, targetPath);
        transfer_files(sourcePath, targetPath, sourcePath);

        // Label File
        let l = targetPath + "/.labels.txt";   // adds new dot file in repo
        fs.appendFile(l, "manifest" + manifest_num + " - ", (err) => { console.log(err); });   // writes initial manifest label

        res.send('You can find ' + repoName + ' repo at ' + targetPath);

        // ! for filename switch slashes to '/' not '\'
        // * filepath example: C:\Users\rifat\projects
    }
);

/**
 * Check In
 */
app.get(
    '/get_checkin_form',   // locates the check in button in the HTML file
    function(req, res) {
        // Text box information
        // var labelName = req.query.label_name;   // no frills, used to label manifest upon check in
        var sourcePath = req.query.source_path;
        var targetPath = req.query.target_path;

        // checks if the given target directory path exists
        // sends error message if it does not exist
        if (!fs.existsSync(targetPath)) {
            res.send(targetPath + " does not exist");
        } else {
            manifest_num++;   // increments global manifest number
            // build_manifest(sourcePath, targetPath, labelName);   // again no frills
            build_manifest(sourcePath, targetPath);
            transfer_files(sourcePath, targetPath, sourcePath);

            // Appends to the already existing label file with the updated manifest file and manifest number
            let l = targetPath + "/.labels.txt"
            fs.appendFile(l, "\nmanifest" + manifest_num + " - ", (err) => { console.log(err); });
            res.send('You can find your changes at ' + targetPath);
        }
    }
);

/**
 * Builds the manifest and writes the necessary information
 * @param {string} sourcePath - source project tree path
 * @param {string} targetPath - target repository path
 */
function build_manifest(sourcePath, targetPath) {
    let a = targetPath + "/.manifest" + manifest_num + ".txt";
    // Date object used for the today's date and time manifest is created
    var time = new Date();
    let year = time.getFullYear();
    let day = time.getDate();
    let month = time.getMonth() + 1;
    let hour = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    let timestamp = year + "-" + day + "-" + month + " " + hour + ":" + minutes + ":" + seconds + "\n";

    // Information that is written in header of manifest file
    let commandLine = "create " + sourcePath + " " + targetPath + "\n";
    fs.appendFileSync(a, commandLine, function(err) {
        if (err) throw err;
    });
    fs.appendFileSync(a, timestamp, function(err) {
        if (err)
            throw err;
        // debug
        // console.log("added timestamp");
    });
    fs.appendFileSync(a, "Files added:\n", function(err) {
        if (err)
            throw err;
    })
}

/**
 * Labeling
 */
app.get(
    '/get_label_form',   // locates the label button in the HTML file
    function(req, res) {
        // Text box information
        // var manifestName = req.query.mani_name;   // no frills
        var targetPath = req.query.target_path; // includes manifest file name
        var labelName = req.query.label_name;

        // Appends label name to the labels file
        append_label(targetPath, labelName);

        let out = "added the label " + labelName + " associated with the manifest file specified";
        res.send(out);
    }
);

/**
 * Appends a label name to the .labels.txt file.
 * @param {string} targetPath - includes the target directory and the manifest file being labeled
 * @param {string} labelName - the label name provided
 */
function append_label(targetPath, labelName) {
    // debug
    // console.log("RUNNING labelFile");
    // let labeltxt = targetPath + '/.labels.txt'

    let manifestFile = targetPath.substr(last_slash_mark(targetPath) + 1);

    targetPath = targetPath.substr(0, last_slash_mark(targetPath));
    // debug
    // console.log(manifestFile);

    dotMarker = manifestFile.lastIndexOf('.') - 1;
    let manifestName = manifestFile.substr(1, dotMarker);
    let labeltxt = targetPath.replace(targetPath, targetPath + '/.labels.txt');
    // debug
    // console.log("MN", manifestName)
    // fs.appendFileSync(labeltxt, manifestName + " - " + labelName);

    // inline labels
    fs.readFile(labeltxt, 'utf8', (err, content) => {
        if (err) { console.log(err); return err; }

        // locates the manifest name
        // if manifest name is in the list of manifests then add label to the manifest
        // else add the manifest name and label
        if (content.includes(manifestName)) {

            let manNumber = manifestName.indexOf("t") + 1;

            // console.log("M#", manNumber);
            // console.log("MN", manifestName);
            // console.log(manifestName.substr(manNumber));
            // console.log("N#", (parseInt(manifestName.charAt(manNumber)) + 1).toString());

            let nextManifest = manifestName.substr(0, manNumber) + (parseInt(manifestName.charAt(manNumber)) + 1).toString();
            // debug
            // console.log("NM", nextManifest);

            /** @description
             * isolate the manifest name line that a label is being added to
             * isolate it by taking out the list before and after that line
             * modify the line then concatenate everything back together
             */
            let content1 = content.substr(0, content.indexOf(manifestName));
            let content2 = content.substr(content.indexOf(nextManifest));
            let substringManifest = content.substr(content.indexOf(manifestName), content.indexOf(nextManifest) - 1);
            substringManifest += " " + labelName + "\n";
            if (content.indexOf(nextManifest) == -1 || manifest_num == parseInt(manifestName.charAt(manNumber))) {
                //content2 = content.substr(content.lastIndexOf(" "))
                content2 = "";
                substringManifest = content.substr(content.indexOf(manifestName));

                substringManifest += " " + labelName;
            }
            content = content1 + substringManifest + content2;
            // replaces content in the original file with the modifications
            fs.writeFile(labeltxt, content, 'utf8', function(err) {
                if (err) return console.log(err);
            });

            
            // debug
            // console.log(content1);
            // console.log(content2);
            // console.log(content.indexOf(nextManifest))
            // console.log(content);

        } else {
            fs.appendFileSync(labeltxt, "\n" + manifestName + " - " + labelName);
        }
    });
}

/**
 * Listing
 */
app.get(
    '/get_listing_form',   // locates the label button in the HTML file
    function(req, res) {
        // debug
        // console.log("RUNNING listing_form");

        // ! put source folder in string so that we can print out all files in that folder
        // ! have user input the folder path

        // Text box information
        let repoPath = req.query.repo_path;
        var labeltxtPath = path.join(repoPath, '/.labels.txt');
        // debug
        // console.log(repoPath);
        // console.log(labeltxtPath)

        var arrayOfLabels = fs.readFileSync(labeltxtPath, 'utf-8');   // need all the strings in the labels file to iterate and add in <br>'s (new lines)
        // debug
        // console.log(arrayOfLabels);

        // Replaces every \n with a <br> to be registered as a new line in the HTML
        // easy reading of list
        // NOTE: function replaceAll gives an error hence the while loop
        while (arrayOfLabels.includes("\n")) {
            arrayOfLabels = arrayOfLabels.replace("\n", "<br>");
        }

        res.send("List of Labels: <br><br>" + arrayOfLabels);
    }
);

/**
 * Check Out
 */
app.get(
    '/get_checkOut_text',   // locates the check out button in the HTML file
    function(req, res) {
        // debug
        // console.log("Running Checkout_form!!!");

        // Text box information
        var maniPath = req.query.mani_path;
        var sourcePath = req.query.target_path;
        var maniname = req.query.mani_label_name;
        
        // debug
        // console.log(maniPath);
        // console.log(sourcePath);
        // console.log(maniname);

        // checks if the provided manifest name is a .manifest# or an associated label to the manifest
        // if name includes "manifest" in it then run with the manifest name
        // else determine which is manifest file name with the label name provided
        if (maniname.includes("manifest")) {
            maniPath = path.join(maniPath, maniname);
            checkout(maniPath, sourcePath);
        } else {
            let labelpath = maniPath + "/.labels.txt";
            fs.readFile(labelpath, 'utf8', (err, content) => {
                if (err) { console.log(err); return err; }

                let labels = content.split("\n");
                // debug
                // console.log("line 157 and labels: ", labels);

                // determines which manfiest name is associated with the label name provided
                labels.forEach(line => {
                    if (line.includes(maniname)) {
                        // debug
                        // console.log("line 160 and line: ", line);
                        let manifestnum = "." + line.substr(0, 9) + ".txt";
                        console.log("manifestname from line:", manifestnum);
                        maniPath = path.join(maniPath, manifestnum);
                        checkout(maniPath, sourcePath);
                    }
                });

            });
        }

        res.send('You can find ' + maniname + ' files at ' + sourcePath);
    }
)

/**
 * Reads the manifest file and separates files between the "@" symbol
 * Left of the "@" symbol is the artifact ID, the original file name is derived from this
 * Right of the "@" symbol is the original source path directory path
 * Attach the root the user wants to copy files back into to the front fo this source path
 * By doing so the file path names resume to the original versions and the contents
 * can be copied over
 * Source (maniPath) is the repo manifest file, includes the manifest file at the end of path
 * Target (targetPath) is the user defined check out directory, where the files are going
 * @param {string} maniPath - repository directory
 * @param {string} targetPath - check out directory
 */
function checkout(maniPath, targetPath) {
    var repoPath = maniPath.substr(0, last_slash_mark(maniPath));
    
    // debug
    // console.log(manifestFile);
    // console.log(repoPath);

    // reads the manifest file and distributes the files to checkout directory
    fs.readFile(maniPath, 'utf8', (err, content) => {
        if (err) { console.log(err); return err; }

        let filenms = content.substr(content.lastIndexOf(":") + 1);
        let arr = filenms.split("\n");
        // debug
        // console.log(filenms);
        // console.log("split stuff: " + arr);

        for (let i = 1; i < arr.length - 1; i++) {
            // debug
            // console.log(i + ". " + arr[i]);

            let artnm = arr[i].substr(0, arr[i].indexOf("@") - 1); // the full artifact id name
            let subs = arr[i].substr(arr[i].indexOf("@") + 2); // the subdirectory 

            // SLASH CHECK CODE
            var slashCheck = subs.indexOf('/')
            if (slashCheck < 0) {
                subseg = subs.split('\\');
                subs = subseg.join("/"); //changed \\ to /
            } else {
                subseg = subs.split('/');
                subs = subseg.join("/");
            }

            let filenam = artnm.substr(artnm.lastIndexOf("-") + 1); // the original file name
            let direc = targetPath + subs; // the full directory of where things should go 
            // debug
            // console.log("artnm: " + artnm);
            // console.log("subs: " + subs);
            // console.log("normal filename: " + filenam);
            // console.log("the full path: " + direc); 
            // console.log("\n");

            direc = targetPath;
            console.log(subseg)
            subseg.forEach(item => {
                console.log(item);
                direc = path.join(direc, item);
                // debug
                // console.log("DIR", direc);

                // creates a new directory if it does not exist
                if (!fs.existsSync(direc))
                    fs.mkdirSync(direc);
            });

            // debug
            // console.log("\nmani path:", maniPath);
            // console.log("repo path:", repoPath);
            // console.log("manifest file:", manifestFile);

            let originalFile = path.join(repoPath, artnm); // repoPath + '/' + artnm;
            let checkoutDirec = path.join(direc, filenam); // direc + '/' + filenam;
            
            // debug
            // console.log("TM", tempName);
            // console.log("checkout Directory: ", checkoutDirec);
            // console.log("original File", originalFile);
            // console.log("\n");

            // copies over contents to the checkout directory
            fs.copyFile(originalFile, checkoutDirec, fs.constants.COPYFILE_FICLONE, function(err) {
                if (err) { console.log(err); }
                // debug
                // console.log("after copied:", tempName);
            });
        }
    });
}

/**
 * Searches for the last index of a slash mark
 * Works for Windows "\\" or Mac "/" systems
 * Returns the integer index
 * @param {string} pathForIndex - path name that needs to be indexed for the last slash mark in it
 * @returns {int} slashMarker - index of the last slash mark in the path name
 */
function last_slash_mark(pathForIndex) {
    let slashMarker = pathForIndex.lastIndexOf('/')
    if (slashMarker < 0) {
        slashMarker = pathForIndex.lastIndexOf('\\');
    }
    return slashMarker;
}

/**
 * Recursive function that transfers all files in source directory to target directory
 * Generates an artifact ID if the file path is a file
 * However, if the file path is a directory then run transfer_files() on it
 * @param {string} filePath - path name of a file, is a directory if one is encountered in the source directory
 * @param {string} targetPath - path for target directory, repository directory
 * @param {string} ogsourcePath - path for the original root path directory, remains the same for every recursion
 */
function transfer_files(filePath, targetPath, ogsourcePath) {
    let filenames = fs.readdirSync(filePath);
    for (let i = 0; i < filenames.length; ++i) {
        // removes dot files from list, but
        // prevents manifest dot files from being deleted
        if (filenames[i].charAt(0) == '.' && !(filenames[i].includes('.manifest'))) {
            fs.unlinkSync(path.join(filePath, filenames[i]));
            filenames.splice(i, 1);

            // debug
            console.log("Removing - " + filenames[i]);
            // console.log(fs.readFileSync(filenames[i], 'utf8'));
        }
    }
    filenames.forEach(file => {
        let temp = filePath; // original file path is retained with the temp variable
        filePath = path.join(filePath, file); // change filePath to base
        // debug
        // console.log('File Path:', filePath)

        // if the file path is a file then generate its artifact ID
        // else the file path must be a directory t/f call transfer_files() on it
        if (fse.lstatSync(filePath).isFile()) {
            var content = fs.readFileSync(filePath, 'utf8');
            artID(filePath, content, targetPath, file, ogsourcePath);
            filePath = temp;
        } else {
            transfer_files(filePath, targetPath, ogsourcePath);
            filePath = temp;
        }
    });
}

/**
 * Generates the Artifact ID for the file passed in
 * @module Artifact ID structure:
 * - Part A - hexadecimal calculation for the source path characters
 * - Part B - hexadecimal length of the file
 * - Part C - hexadecimal calculation for the contents characters in the file
 * @param {string} filePath - file that needs an artifact ID generated
 * @param {string} content - content in the file
 * @param {string} targetPath - target directory, where the file will be copied/moved to
 * @param {string} file - file name
 * @param {string} ogsourcePath - original source path directory
 */
function artID(filePath, content, targetPath, file, ogsourcePath) {
    var hashOffset = 4; // four patterned calculations
    var r = 0; // remainder
    var hexTotal = 0; // hexadecimal calculation

    // debug
    // console.log("FilePath:", filePath);

    for (let iter = 0; iter < content.length; ++iter) {
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

    let tempName = filePath.substr(0, last_slash_mark(filePath)) + '/' + artifactName;

    // debug
    // console.log("Hex Total:", hexTotal, "C: ", C);
    // console.log('FP:', filePath);
    // console.log('TempName:', tempName);
    // console.log('TP:', targetPath);
    // console.log('F:', file);
    // console.log('Name:', name);
    // if(fs.exists(tempName, (err) => { if(err) { console.log(err); } console.log('TempName Exists...'); }));
    // if(fs.exists(targetPath, (err) => { if(err) { console.log(err); } console.log('Target Exists...'); }));
    // if(fs.exists(name, (err) => { if(err) { console.log(err); } console.log('Name Exists...'); }));

    fs.copyFile(filePath, tempName, fs.constants.COPYFILE_FICLONE, function(err) {
        if (err) { console.log(err); }
        // NOTE: causes error if file already exists, should use fs.exists() to check for error
        fse.move(tempName, name, (err) => { console.log(err); });
    });

    /* adds to the existing manifest file with artifact ID files */
    let extralen = filePath.length - ogsourcePath.length - file.length;
    var sub = filePath.substr(ogsourcePath.length, extralen); //could be length-1 might have to double check on that possible point of error here 
    let a = targetPath + "/.manifest" + manifest_num + ".txt";
    
    // debug
    // console.log(sub);
    // console.log(extralen);

    console.log(artifactName + " @ " + sub + "\n");
    fs.appendFile(a, artifactName + " @ " + sub + "\n", function(err) {
        if (err) throw err;
        console.log("added " + file);
        console.log(artifactName + " @ " + sub);
    });

    // debug
    // console.log('Art ID: A:' + A + '/B:' + B + '-C:' + C + '-F:' + file);
}

/**
 * Home page
 */
app.get(
    '/',
    function(req, res) {
        res.sendFile(
            './vcswebsite.html', { root: __dirname }
        );
    }
);

/**
 * Port # the home page is located on
 */
app.listen(
    3000,
    function() {
        console.log("vcsbridge.js listening on port 3000!");
    }
);
