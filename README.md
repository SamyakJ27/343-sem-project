# Version Control System
## Gung Hoes - James, Samyak, Rishika, Rifat
### CECS 343 - Sec 06 

---

## Description:
This purpose of this project is to mirror a version control system similar to github. This repository stores a semester-long project assigned by Charles Siska, our CECS 343 professor at CSULB.

## Contents: 
- background.jpg
- files.html
- files.js
- package-lock.json
- package.json
- vcsbridge.js
- vcswebsite.html
- style.css
- README.md 

## External Requirements: 
Node Js, Express Js

## Installation & Setup: 
Need to install Node and Express Js and type in `node vcsbridge` into console to run the server and use this program. Go to web browser and search up `localhost:3000` to launch this on to a responsive webpage. 

## Results: 
When information is inputted into form text boxes, user should see a responsive message acknowledging their action then logging that into the server. The user must go back to the previous page to continue any more VCS functions.

## Features: 
Users can create a repository that is stored onto their local storage, check in and check out any files in that storage, merge any conflicting changes, and more. We provide user-friendly and colorful web page for all these functions as well. With each submission, the user is notified of the function results and can see them in the specified file directory.

## Bugs: 
- The folder hierarchies are not copying over into the new manifest upon completing the merge process.
- The source branch file is also not updated since it is dependent on the new manifest and the old manifest.
- Extra long Artifact ID's are generated after the Merge-In function.

### Third Party Material:
stackoverflow.com, w3schools.com, nodejs.org, geeksforgeeks.com