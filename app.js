#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const INPUT_EXT = "csv";
const IMAGE_EXT = "jpg,png,gif";
const SUFFIX = ""; // Output csv suffix
const REGEX = RegExp('odooimage\\\(([^\)]+)\\\)', 'g');

const MAIN_PATH = "./data";  // Input csv path is same as exe location
const IMAGES_PATH = "images";
const ERROR_PATH = "error.log";

var error = "";

console.log("Start convert");
glob(MAIN_PATH + "/*." + INPUT_EXT, function (er, files) {
  files.forEach(e => {
    console.log("Processing: "+ e);
    let csvPath = e;
    toBase64(csvPath);
  });
})
console.log("End convert");

function toBase64(inputPath) {
  fs.readFile(inputPath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    function inline(matchText, match_1) {
      console.log(matchText+" "+match_1);
      let imageName = match_1.replace(/['"]/g, '');

      // Read all images in images folder
      try{
        let files = glob.sync(path.join(MAIN_PATH,IMAGES_PATH,imageName + ".{" + IMAGE_EXT + "}"));
        if (files) {
          let fileData = fs.readFileSync(files[0]);
          let fileBase64 = Buffer.from(fileData).toString('base64');
          return fileBase64;
        }
        return matchText;
      }
      catch (e){
        console.log("File not found:" + imageName);
        error += imageName +"\n";
        return matchText;
      } 
    }     
    if (REGEX.test(data)) {
      let ext = path.extname(inputPath);      
      let outputPath = path.join(MAIN_PATH, path.basename(inputPath, ext) + SUFFIX + ext);
      
      console.log("Converted: " + inputPath + " >> " + outputPath);
      let result = data.replace(REGEX, inline);
      fs.writeFile(outputPath, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });         
    }

    let errorPath = path.join(MAIN_PATH, ERROR_PATH);
    console.log(error);
    if (error === ""){  
      console.log("Deleting error.log");
      fs.unlink(errorPath, (err) => {
        if (err) {
          console.error(err)
        }
      });
    }
    else{
      fs.writeFile(errorPath, error, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }  

  });
}
