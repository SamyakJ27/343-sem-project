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
        var flatfile = path.basename(targetPath); // ? something bc we add folder called 'something' to the end

        console.log('Repo Name recieved: ' + repoName);
        console.log('Source Path recieved: ' + sourcePath);
        console.log('Target Path received: ' + targetPath);
        console.log('Base Name: ' + flatfile);
        // flatRecursion(targetPath);

        // Error Handling for existing directories
        // if (!fs.existsSync(targetPath + '/' + repoName)) {
        //     fs.mkdirSync(targetPath + '/' + repoName);
        //     targetPath = targetPath + '/' + repoName;
        // }
        fse.copy(sourcePath, targetPath,
            () => {
                console.log("\nFile successfully stored!\n");
                // console.log("Running Art...");

                // fs.readdir(targetPath, (err, files) => {});
                //     if(err) console.log(err);
                //     files.forEach(file => {
                //         // if(file is in directory then move on)
                //         if(file.charAt(0) == '.')
                //             fs.unlinkSync(path.join(targetPath, file));
                //         else if(fs.lstatSync(path.join(targetPath, file)).isFile())
                //             console.log("File - ", file);
                //         else if(fs.lstatSync(path.join(targetPath, file)).isDirectory()) {
                //             console.log("Directory - ", file);
                //             flattenFiles(targetPath, path.join(targetPath, file)); // may need to pass in lstatSync
                //         }
                //     });
                // });

                // let content = fs.readFileSync(path.join(targetPath, "test.txt"), 'utf8');
                // console.log(content);

                // const removeDir = function (targetPath) {
                //     if(fs.existsSync(targetPath)) {
                //         const files = fs.readdirSync(targetPath);

                //         if(files.length > 0) {
                //             files.forEach(filename => {
                //                 if(fs.statSync(path.join(targetPath, filename)).isDirectory()) {
                //                     removeDir(path.join(targetPath, filename));
                //                 }
                //                 else {
                //                     fs.unlinkSync(path.join(targetPath, filename));
                //                 }
                //             });
                //         }
                //         else { console.log("No Files"); }
                //     }
                //     else { console.log("No Directory"); }
                // };

                // flatRecursion(targetPath);
                // console.log("\nCurrent filenames: ");
                // fs.readdirSync(targetPath).forEach(file => {
                //     console.log(file);
                // });

                artID(targetPath); // executes after copy is complete
                // console.log("Running Art...");
            }
        );

        res.send('You can find ' + repoName + ' repo at ' + targetPath);

        // artID(targetPath);
        // ! for filename switch slashes to '/' not '\'
        // * filepath example: C:\Users\rifat\projects
        //fs.writeFileSync(sourcePath + '/' + repoName + '.txt', targetPath, 'utf8'); //concatenates filepath given and repo name to create text file in user's desired location
    }
);
/* 
function flatRecursion(targetPath) {
    var flatfile = path.basename(targetPath);
    console.log("\nCurrent filenames: ");
    fs.readdirSync(flatfile).forEach(file => {
        console.log(file);
    });
} */

// function flattenFiles(targetPath, tempDir) {
//     fs.readdir(tempDir, (err, files) => {
//         if(err) console.log(err);
//         files.forEach(file => {
//             if(file.charAt(0) == '.')
//                 fs.unlinkSync(path.join(tempDir, file));
//             else if(fs.lstatSync(path.join(tempDir, file)).isFile()) {
//                 console.log("File - ", file);
//                 fse.move(path.join(tempDir, temp), targetPath);
//                 fse.rename(path.join(tempDir, file), targetPath + '/dummy', (err) => {
//                     if(err) console.log(err);
//                     else console.log(file);
//                 });
//             }
//             else if(fs.lstatSync(path.join(tempDir, file)).isDirectory())
//                 // console.log("Directory - ", file);
//                 flattenFiles(targetPath, file); 
//         });
//         // console.log("Unlink end");
//         // fs.unlinkSync(tempDir);
//     });
// }

function flatRecursion(targetPath) {

    console.log(targetPath);
    fs.readdir(targetPath, (err, files) => {
        if(err) { console.log(err); }
        let dir = false;
        files.forEach(file => {
            let file_stat = fs.lstatSync(path.join(targetPath, file));
            if(file_stat.isFile()) {
                dir = false;
            }
            // else if()
        });
    });

    // var flatfile = path.basename(targetPath); // c: user/desktop
    // console.log("\nCurrent filenames: ");
    // fs.readdirSync(flatfile).forEach(file => { // c: user/desktop/test
    //     console.log(file);
    //     if(fs.lstatSync(file).isDirectory()) {
    //         fs.move(flatfile + '/' + file, targetPath, console.error);
    //         return flatRecursion(flatfile + '/' + file);
    //     }
    //         // return flatRecursion(file);
    //     // else if(!fs.existsSync(file)) {
    //     //     return;
    //     // }
    //     else {
    //         // fse.move(targetPath + 'NEXT DIR', targetPath, console.error);
    //         // fs.move(flatfile + '/' + file, targetPath, console.error);
    //         return ;
    //     }

        /* ERROR HANDLING:
        try{
            fs.lstatSync("/some/path").isDirectory()
        }catch(e){
            // Handle error
            if(e.code == 'ENOENT'){
                //no such file or directory
                //do something
            }else {
                //do something else
            }
        }*/
    // });
}

/* function getCurrentFilenames() { 
    console.log("\nCurrent filenames:"); 
    fs.readdirSync(__dirname).forEach(file => { 
      console.log(file); 
    }); 
  }  */
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
/*
app.getPath( //comeback to this 
    '/',
    function(file) {
        var element = file.split("/");
        var str = "";
        for(var i = 0; i < element.length-1; i++){
            str += element[i] + "/";
        }
        return str;
    } 
);
*/

/**
 * Artifact ID Generator
 * Generates a filename according to file data passed in through form
 */
function artID(rootName) {

    var hashOffset = 4;
    var r = 0; // remainder
    var base = rootName;
    // console.log(rootName.toString().toString(16));

    // debug
    // for(let i = 0; i < rootName.length; ++i) {
    //     // console.log(rootName.charCodeAt(i).toString(16));
    //     console.log(rootName.charCodeAt(i).toString(16));
    // }

    function fileList(rootName) {
        let filenames = fs.readdirSync(rootName);
        for(let i = 0; i < filenames.length; ++i) {
            // removes dot files from list
            if(filenames[i].charAt(0) == '.') {
                console.log("Removing - " + filenames[i]);
                fs.unlinkSync(path.join(rootName, filenames[i]));
                // console.log(fs.readFileSync(filenames[i], 'utf8'));
                filenames.splice(i, 1);
            }
        }
        filenames.forEach(file => {
            let filePath = path.join(rootName, file); // change rootName to base
            var content; // contents inside the file
            if(fse.lstatSync(filePath).isFile()) {
                content = fs.readFileSync(filePath, 'utf8');
                // console.log(19 == content.length);
                var hexTotal = 0;
                console.log("FilePath:", filePath);
                for (let iter = 0; iter < content.length; ++iter) {
                    // r = iter % hashOffset;
                    r = iter % hashOffset;
                    if (r == 0) {
                        // hexTotal += file.charAt(iter) * 3; // need to iterate through characters, wrong right now
                        // hexTotal += content.substr(iter, 1) * 3;
                        hexTotal += content.charCodeAt(iter) * 3;
                    }
                    else if (r == 1 || r == 3) {
                        // hexTotal += file.charAt(iter) * 7;
                        // hexTotal += content.substr(iter, 1) * 7;
                        hexTotal += content.charCodeAt(iter) * 7;
                    }
                    else if (r == 2) {
                        // hexTotal += file.charAt(iter) * 11;
                        // hexTotal += content.substr(iter, 1) * 11;
                        hexTotal += content.charCodeAt(iter) * 11;
                    }
                }
                var pathHex = 0;
                // does not calculate/truncate for relative path
                // filePath is not the relative source project tree path
                for(let f = 0; f < filePath.length; ++f) {
                    pathHex += filePath.charCodeAt(f);
                }
                var A = pathHex.toString(16); 
                A = A.substr(A.length - 2, A.length); 
                var B = fs.statSync(filePath).size.toString(16); // is size the same as file length?
                while(B.length < 4)
                    B = '0' + B;
                var C = hexTotal.toString(16);
                while(C.length < 4)
                    C = '0' + C;
                console.log("Hex Total:", hexTotal, "C: ", C);
                // fs.rename(file, '' + A + '/' + B + '/' + C + '/' + file + '.' + E);
                fs.rename(filePath, '' + base + '/' + A + '-' + B + '-' + C + '-' + file, (err) => { console.log(err); });
                // debug
                var artID = console.log('Art ID: A:' + A + '/B:' + B + '-C:' + C + '-F:' + file);
                /**write new file contatining all artifact ID */
                //get targetpath -> writefile based on targetpath into local storage
                //fs.writeFileSync(targetPath + '/artID.txt', artID, 'utf8');
            // }
            }
            else {
                fileList(filePath); // recursion for any folders
            }
        });
    }
    // debug
    // console.log("Running After Filenames...", filenames);
    // let content = fs.readFileSync(path.join(rootName, "test.txt"), 'utf8');
    // console.log(content);

    // DO NOT DELETE!! call to fileList function
    fileList(rootName);

    // debug
    // function hexConvert(text) {
    //     var hex = '';
    //     for (var i = 0; i < text.length; ++i) {
    //         hex += text.charAt(i).toString(16);
    //     }
    //     console.log('Hex', hex);
    //     return hex;
    // }
}