#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const INPUT_EXT = "csv";
const IMAGE_EXT = "jpg,png,gif";
const SUFFIX = ""; // Output csv suffix, "" means replace original files
const REGEX = RegExp('odooimage\\\(([^\)]+)\\\)', 'g');

const CSV_PATH = "./csv";  // Input csv path is same as exe location
const IMAGES_PATH = "./images";
const ERROR_PATH = "./error.log";
const SUCCESS_PATH = "./success.log";

var error = "";

// Delete all log files
fs.unlink(ERROR_PATH, (err) => {});
fs.unlink(SUCCESS_PATH, (err) => {});

console.log("Start convert");


glob(CSV_PATH + "/*." + INPUT_EXT, function (er, files) {
  files.forEach(e => {
    console.log("Processing: " + e);
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
      console.log(matchText + " " + match_1);
      let imageName = match_1.replace(/['"]/g, '');

      // Read all images in images folder
      try {
        let files = glob.sync(path.join(IMAGES_PATH, imageName + ".{" + IMAGE_EXT + "}"));
        if (files) {
          let fileData = fs.readFileSync(files[0]);
          let fileBase64 = Buffer.from(fileData).toString('base64');
          return fileBase64;
        }
        return matchText;
      }
      catch (e) {
        console.log("File not found:" + imageName);
        error += imageName + "\n";
        return matchText;
      }
    }

    if (REGEX.test(data)) {
      let ext = path.extname(inputPath);
      let outputPath = path.join(CSV_PATH, path.basename(inputPath, ext) + SUFFIX + ext);

      console.log("Converted: " + inputPath + " >> " + outputPath);
      let result = data.replace(REGEX, inline);
      fs.writeFile(outputPath, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }

    if (error === "") { 
      fs.writeFile(SUCCESS_PATH, "Successfully converted", 'utf8', function (err) {
        if (err) return console.log(err);
      }); 
    }
    else {
      fs.writeFile(ERROR_PATH, error, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }

  });
}
