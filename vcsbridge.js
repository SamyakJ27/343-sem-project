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
    '/get_mergeout_text', // locates the merge out button in the HTML file
    function (req, res) {
        // Text box information
        var sourcePath = req.query.source_path;
        var maniPath = req.query.mani_path;  //would this contain the manifest file with it? for hte project tree part to merge with

        // var repoPath = maniPath.substr(0, last_slash_mark(maniPath));

        let sb = sourcePath + "/.sourcebranch.txt";
        var sourceBranch = fs.readFileSync(sb, 'utf8', (err) => {
            if (err) { console.log(err); return err; }
        });

        var repoPath = maniPath.substr(0, last_slash_mark(maniPath));

        changes_direc = path.join(repoPath, "changes");
        if (!(fs.existsSync(changes_direc))) {
            fs.mkdirSync(changes_direc);
        }
        build_manifest(sourcePath, changes_direc);

        twocalls(transfer_files, merge_out, sourcePath, changes_direc, maniPath, sourceBranch);

        //transfer_files(sourcePath, changes_direc, sourcePath);
        //console.log("transfer files called before mergeout, lets see how this goes\n");
        //merge_out(sourcePath, maniPath, sourceBranch);
    }
);



function twocalls(func1, func2, sp, cd, mp, sb) {
    console.log("trying callback functions");
    func1(sp, cd, sp);
    console.log("between functions");
    func2(sp, mp, sb);
}


/**
 * 
 * @param {string} sourcePath 
 * @param {string} repoPath 
 */
function merge_out(sourcePath, maniPath, sourceBranch) {
    /* 
    merge out is only part 1 of the merge process
    so maybe want to transfer the files over to the repo in a changes directory
    then user can manually do the merge there and
    merge in will transfer those files in the changes directory into the repo?
    */
    console.log("merge_out was called");

    var manifestname = maniPath.substr(last_slash_mark(maniPath) + 1);
    var repoPath = maniPath.substr(0, last_slash_mark(maniPath));
    var maniname = manifestname.substring(1, manifestname.lastIndexOf("."));

    changes_direc = path.join(repoPath, "changes");
    if (!(fs.existsSync(changes_direc))) {
        fs.mkdirSync(changes_direc);
    }


    let rb = repoPath + "/.branches.txt";
    var repoBranches = fs.readFileSync(rb, 'utf8', (err) => {
        if (err) { console.log(err); return err; }
    });

    //build_manifest(sourcePath, changes_direc);
    //transfer_files(sourcePath, changes_direc, sourcePath);
    // debug
    console.log("Transfer complete\n\n");

    //calculate the grandma manifest and include that as well
    //read artifact id from given manifest file and compare with the manifest file generated above 
    //then go through the names and see which files can stay and which one need to go 


    // target artifact IDs
    var targetIDs = [];
    let manicontent = fs.readFileSync(maniPath, 'utf8', (err) => {
        if (err) { console.log(err); return err; }
    });

    let filenms = manicontent.substr(manicontent.lastIndexOf(":") + 1);
    let arr = filenms.split("\n");
    for (let i = 1; i < arr.length - 1; i++) {
        let tID = arr[i].substring(0, arr[i].indexOf("@") - 1);
        console.log("inside loop tID: " + tID);
        targetIDs.push(tID);
    }

    // source artifact IDs
    if (fs.existsSync(path.join(repoPath, "changes", ".manifest" + manifest_num + ".txt"))) {
        console.log("it exists!!!");
    }

    // let sourcemani = fs.readFileSync(path.join(changes_direc, ".manifest" + manifest_num + ".txt"), 'utf8');
    var sourceIDs = [];
    var sourceDirecs = [];   // needed to add original source directories since the files don't "exist" in the changes directory yet
    let sourcemani = fs.readFileSync(path.join(repoPath, "changes", ".manifest" + manifest_num + ".txt"), 'utf8', (err) => {
        if (err) { console.log(err); return err; }
    });
    console.log("the manifest file being read: \n" + sourcemani);
    console.log(sourcemani);

    filenms = sourcemani.substring(sourcemani.lastIndexOf(":") + 1);
    console.log("filenames inside the source manifest: " + filenms);
    arr = filenms.split("\n");
    for (let i = 1; i < arr.length - 1; i++) {
        let sID = arr[i].substring(0, arr[i].indexOf("@") - 1);
        let sDir = arr[i].substring(arr[i].indexOf("@") + 2);
        console.log("inside the loop sID: " + sID);
        sourceIDs.push(sID);
        sourceDirecs.push(sDir + sID);
    }


    // var sourceIDs = fs.readdirSync(repoPath + "/changes", 'utf8', (err) => {
    //     if (err) { console.log(err); }
    // });

    // sourceIDs.splice(sourceIDs.indexOf(".manifest" + manifest_num + ".txt"), 1);

    // debug
    console.log("Source IDs: " + sourceIDs + "\n\n");
    console.log("Source Dirs: " + sourceDirecs + "\n\n");
    console.log("Target IDs: " + targetIDs + "\n\n");

    // NOTE: readdirSync() reads all the filenames and puts into array
    // fs.readFileSync(maniPath, 'utf8', (err, content) => {
    //     if (err) { console.log(err); }

    //     let filenms = content.substr(content.lastIndexOf(":") + 1);
    //     let arr = filenms.split("\n");
    //     // debug
    //     // console.log(filenms);
    //     // console.log("split stuff: " + arr);

    //     for (let i = 1; i < arr.length - 1; i++) {
    //         // debug
    //         // console.log(i + ". " + arr[i]);

    //         let sID = arr[i].substr(0, arr[i].indexOf("@") - 1); // the full artifact id name
    //         sourceIDs.add(tID);
    //     }
    // });

    // compare the sourceIDs with the targetIDs
    for (let tID of targetIDs) {
        tIDPath = tID.substr(0, tID.indexOf("-"));
        tIDName = tID.substr(tID.lastIndexOf("-") + 1, tID.lastIndexOf("."));
        let case4fail = true;

        console.log("tID: " + tID);
        console.log("tIDPath: " + tIDPath);
        console.log("tIDName: " + tIDName);

        console.log("checking case 4");
        //case 4 is checked first because of its complexity 
        for (let sID of sourceIDs) {
            if (sID.includes(tIDPath) && sID.includes(tIDName)) {

                //let sID = sourceIDs[sourceIDs.indexOf(tIDName)];
                tID_MT = tID.substr(0, tID.lastIndexOf(".")) + "_MT" + tID.substr(tID.lastIndexOf("."));
                sID_MR = sID.substr(0, tID.lastIndexOf(".")) + "_MR" + tID.substr(tID.lastIndexOf("."));
                // debug
                console.log("tID: " + tID);
                console.log("sID: " + sID);

                fs.copyFile(path.join(repoPath, tID), path.join(changes_direc, tID_MT), fs.constants.COPYFILE_FICLONE, function (err) {
                    if (err) { console.log(err); }
                });

                // grandma section: finding the grandma manifest then extracting the correct artifact ID and copy file from repo to changes directory
                grandmaFile = path.join(repoPath, find_grandma(sourceBranch, repoBranches, maniname));
                console.log("\nAfter grandma was called: \n\n");
                grandmaMani = fs.readFileSync(grandmaFile, 'utf8', (err) => {
                    if (err) { console.log(err); return err; }
                });
                grandmaMani = grandmaMani.split("\n");
                let gID = "";
                grandmaMani.forEach((fileLine) => {
                    if (fileLine.indexOf(tIDName) > -1) {
                        gID = fileLine.substring(0, fileLine.indexOf("@") - 1);;
                    }
                });
                gID = gID.substr(0, gID.lastIndexOf(".")) + "_GM" + gID.substr(gID.lastIndexOf("."));
                console.log("gID:", gID);
                fs.copyFile(path.join(repoPath, gID), path.join(changes_direc, gID), fs.constants.COPYFILE_FICLONE, function (err) {
                    if (err) { console.log(err); }
                });


                fs.readdir(changes_direc, (files, err) => {
                    if (err) { console.log(err); }
                    console.log("\n\n" + files + "\n\n");
                });

                // debug
                // if(fs.existsSync(path.join(changes_direc, sID))) {
                //     console.log("\n\nsID exists\n\n");
                // }
                // if(fs.existsSync(path.join(changes_direc, sID_MR))) {
                //     console.log("sID_MR exists");
                // }

                // Indexes the correct source directory
                console.log("\n\nSource Direcs for each");
                let dirIndex = -1;
                sourceDirecs.forEach((dir) => {
                    console.log(dir);
                    if (dir.indexOf(sID) > -1) { console.log("dirIndex = " + sourceDirecs.indexOf(dir)); dirIndex = sourceDirecs.indexOf(dir); return; }
                });
                console.log("dirIndex = " + dirIndex);

                fs.copyFile(path.join(sourcePath, sourceDirecs[dirIndex]), path.join(changes_direc, sID_MR), fs.constants.COPYFILE_FICLONE, (err) => {
                    if (err) { console.log(err); }
                });
                case4fail = false;
                break;
            }
        }

        // Case 1 and Case 2
        if (!sourceIDs.includes(tID) && case4fail) {
            // copies excluded files from target into the source's changes folder
            console.log("CASE 1 & 2\n");
            fs.copyFile(path.join(repoPath, tID), path.join(changes_direc, tID), fs.constants.COPYFILE_FICLONE, function (err) {
                if (err) { console.log(err); }

            }); //need to put some more stuff here
        }
        // Case 3
        else if (sourceIDs.includes(tID) && case4fail) {
            console.log("CASE 3\n");
            fse.move(path.join(repoPath, tID), path.join(changes_direc, tID), function (err) {
                if (err) { console.log(err); }
            });
        }
    }
}

function find_grandma(sourceBranch, repoBranches, maniname) {
    // use the sourcebranch and branches files to find the last matching manifest
    // parameters will need to be the source project tree and the target branches according to the manifest

    // for loop the sourcebranch then see which repo branch matches
    // go to next line in repobranches if a manifest does not match
    // keep comparing until the end of the file

    console.log("we are finding grandma here");
    let gMA = "";
    console.log("sourcebranches: " + sourceBranch);
    console.log("repoBranches: " + repoBranches);
    console.log("maniname: " + maniname);
    //issues i found out, sourcebranch is a string of one line, need to split on ", " include hte space as well 
    //for repobranchs you have the entire file, need to seperate them by lines and then go throught each part of htis new variable 
    //and divide them into lists on hte same ", " and then loop throught this list and see what hte latest common is based on the sourcebranch list 
    //also when returning, need to inclue the . before and the .txt with the output becausr that how its being used in the method 
    let branchs = repoBranches.split("\n");
    console.log("branches: " + branchs + "\n");
    for (let br of branchs) {
        console.log("br: " + br);
        if (br.includes(maniname)) {
            let manis = br.split(", ");
            console.log("manis: " + manis + "space check and size: " + manis.length);
            for (let i = 0; i < manis.length - 1; i++) {                                 //if any issues arrise it would be here in hte for loop 
                console.log(manis[i]);
                if (sourceBranch.includes(manis[i]) && manis[i] != "") {
                    gMA = manis[i];
                    console.log("gMA: " + gMA);
                }
            }
            // manis.forEach((man) => {
            //     console.log(man);
            //     if (sourceBranch.includes(man)) {
            //         gMA = man;
            //         console.log("gMA: " + gMA);
            //     }
            // });
        }

    }


    // sourceBranch.forEach((sb) => {
    //     if (repoBranches.includes(sb)) {
    //         gMA = sb;
    //     }
    // });

    console.log("\n\ngMA:" + gMA + "\n\n");
    ret = "." + gMA + ".txt";
    console.log("ret: " + ret);
    return ret;
}

app.get(
    '/get_mergein_text', // locates the merge in button in the HTML file
    function (req, res) {
        // Text box information
        var repoPath = req.query.repo_path;
        var targetPath = req.query.target_path;

        merge_in(repoPath, targetPath);
    }
);

/**
 * 
 * @param {string} repoPath 
 * @param {string} targetPath 
 */
function merge_in(repoPath, targetPath) {

}

/**
 * Create Repo
 */
app.get(
    '/get_repo_form',   // locates the create repo button in the HTML file
    // req - request
    // res - result
    function (req, res) {
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

        let c = targetPath + "/.branches.txt";   // adds new dot file in repo
        fs.appendFile(c, "manifest" + manifest_num + ", ", (err) => { console.log(err); });   // writes main branch parent/child replationship

        let p = sourcePath + "/.sourcebranch.txt";
        fs.appendFile(p, "manifest" + manifest_num + ", ", (err) => { console.log(err); });  // writes same parent/child in source folder

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
    function (req, res) {
        // Text box information
        // var labelName = req.query.label_name;   // no frills, used to label manifest upon check in
        var sourcePath = req.query.source_path;
        var targetPath = req.query.target_path;

        let p = sourcePath + "/.sourcebranch.txt";
        //reading the path of the branch
        let path = fs.readFileSync(p, 'utf8', (err) => {
            if (err) { console.log(err); return err; }
        })

        // fs.readFileSync(p, 'utf8', (err, content) => {
        //     if (err) { console.log(err); return err; }

        //     path += content;
        // });

        console.log("the path inside the sourcebranch: " + path + "space check");

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
            let l = targetPath + "/.labels.txt";
            fs.appendFile(l, "\nmanifest" + manifest_num + " - ", (err) => { console.log(err); });


            console.log("the path inside the sourcebranch: " + path);
            //finding the path of this branch and updating it 
            let b = targetPath + "/.branches.txt";
            // let firsthalf = "";
            // let lasthalf = "";
            // let pathline = "";
            let content = fs.readFileSync(b, 'utf8', (err) => {
                if (err) { console.log(err); return err; }
            });

            let lines = content.split("\n");
            let index = 0;

            //console.log("the lines: " + lines);

            for (let line of lines) {
                if (line == path) {
                    break;
                }
                console.log("a line: " + line + "space check");
                index += line.length + 1;
            }
            console.log("index: " + index);

            let firsthalf = content.substr(0, index);
            let lasthalf = content.substr(firsthalf.length + path.length);
            let pathline = content.substr(content.indexOf(path), path.length);

            console.log("og pathline: " + pathline);
            console.log("firsthalf: " + firsthalf);
            console.log("lsatpart: " + lasthalf);

            pathline += "manifest" + manifest_num + ", ";

            console.log("pathline after adding next manifest: " + pathline);

            // fs.readFileSync(b, 'utf8', (err, content) => {
            //     if (err) { console.log(err); return err; }

            //     let firsthalf = content.substr(0, content.indexOf(path));
            //     let lasthalf = content.substr(firsthalf.length + path.length);
            //     let pathline = content.substr(content.indexOf(path), path.length);

            //     console.log("og pathline: " + pathline);
            //     console.log("firsthalf: " + firsthalf);
            //     console.log("lsatpart: " + lasthalf);


            //     pathline += "manifest" + manifest_num + ", ";

            //     console.log("pathline after adding next manifest: " + pathline);
            // });

            fs.writeFile(p, pathline, 'utf8', function (err) {
                if (err) { console.log(err); return err; }
            });

            fs.writeFile(b, firsthalf + pathline + lasthalf, 'utf8', function (err) {
                if (err) { console.log(err); return err; }
            });

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
    fs.appendFileSync(a, commandLine, function (err) {
        if (err) throw err;
    });
    fs.appendFileSync(a, timestamp, function (err) {
        if (err)
            throw err;
        // debug
        // console.log("added timestamp");
    });
    fs.appendFileSync(a, "Files added:\n", function (err) {
        if (err)
            throw err;
    })
}

/**
 * Labeling
 */
app.get(
    '/get_label_form',   // locates the label button in the HTML file
    function (req, res) {
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
            fs.writeFile(labeltxt, content, 'utf8', function (err) {
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
    function (req, res) {
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
    function (req, res) {
        // debug
        // console.log("Running Checkout_form!!!");

        // Text box information
        var maniPath = req.query.mani_path;
        var targetPath = req.query.target_path;
        var maniname = req.query.mani_label_name;

        let manNum = "";
        let branchpath = maniPath + "/.branches.txt";

        // debug
        // console.log(maniPath);
        // console.log(sourcePath);
        // console.log(maniname);

        // checks if the provided manifest name is a .manifest# or an associated label to the manifest
        // if name includes "manifest" in it then run with the manifest name
        // else determine which is manifest file name with the label name provided
        if (maniname.includes("manifest")) {
            maniPath = path.join(maniPath, maniname);
            checkout(maniPath, targetPath);
            manNum += maniname.substr(1, maniname.lastIndexOf(".") - 1);
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
                        checkout(maniPath, targetPath);
                        manNum += manifestnum.substr(1, manifestnum.lastIndexOf('.') - 1);
                    }
                });

            });
        }

        console.log("ManNum in checkout: " + manNum);

        let p = targetPath + "/.sourcebranch.txt";
        fs.readFile(branchpath, 'utf8', (err, content) => {
            if (err) { console.log(err); return err; }

            let paths = content.split("\n");

            console.log("each line before: " + paths);

            for (let line of paths) {
                if (line.includes(manNum)) {
                    let index = line.indexOf(manNum);
                    let path = line.substr(0, index + 11);
                    console.log("path: " + path + "space check");
                    fs.writeFile(p, path, (err) => { console.log(err); });  // writes same parent/child in source folder
                    fs.appendFile(branchpath, "\n" + path, (err) => { console.log(err); })
                    break;
                }
            }

            // paths.forEach(line => {
            //     if (line.includes(manNum)) {
            //         let index = line.indexOf(manNum);
            //         let path = line.substr(0, index + 10);
            //         fs.appendFile(p, path + ", ", (err) => { console.log(err); });  // writes same parent/child in source folder
            //         fs.appendFile(branchpath, "\n" + path, (err) => { console.log(err); })
            //         break;
            //     }
            // });
        });

        //fs.appendFile(p, "manifest" + manifest_num+ ", ", (err) => {console.log(err); });  // writes same parent/child in source folder

        res.send('You can find ' + maniname + ' files at ' + targetPath);
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
            fs.copyFile(originalFile, checkoutDirec, fs.constants.COPYFILE_FICLONE, function (err) {
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
            if (!(filenames[i].includes('.sourcebranch')))   // don't need source branch file in the changes folder for merge out
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
            artID(filePath, content, targetPath, file, ogsourcePath, extra);
            filePath = temp;
        } else {
            transfer_files(filePath, targetPath, ogsourcePath);
            filePath = temp;
        }
    });
}


function extra() {
    console.log("fnished!!");
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
function artID(filePath, content, targetPath, file, ogsourcePath, extra) {
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

    fs.copyFile(filePath, tempName, fs.constants.COPYFILE_FICLONE, function (err) {
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
    fs.appendFileSync(a, artifactName + " @ " + sub + "\n", 'utf8');
    // fs.appendFile(a, artifactName + " @ " + sub + "\n", function (err) {
    //     if (err) throw err;
    //     console.log("added " + file);
    //     console.log(artifactName + " @ " + sub);
    // });

    extra();
    // debug
    // console.log('Art ID: A:' + A + '/B:' + B + '-C:' + C + '-F:' + file);
}

/**
 * Home page
 */
app.get(
    '/',
    function (req, res) {
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
    function () {
        console.log("vcsbridge.js listening on port 3000!");
    }
);
