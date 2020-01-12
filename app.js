#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const INPUT_EXT = "csv";
const IMAGE_EXT = "jpg,png,gif";
const SUFFIX = "_converted";
const REGEX = RegExp('inline\\\(([^\)]+)\\\)', 'g');

const dataPath = "./data";


glob(dataPath + "/*." + INPUT_EXT, function (er, files) {
  files.forEach(e => {
    let csvPath = e;
    toBase64(csvPath);
  });
})

function toBase64(inputPath) {
  fs.readFile(inputPath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    function inline(inlineExpr, quotedPath) {
      let imageName = quotedPath.replace(/['"]/g, '');
      let files = glob.sync(dataPath + "/**/" + imageName + ".{" + IMAGE_EXT + "}");
      if (files) {
        let fileData = fs.readFileSync(files[0]);
        let fileBase64 = Buffer.from(fileData).toString('base64');
        return fileBase64;
      }
      else {
        console.log("File not found:" + imageName);
        return inlineExpr;
      }

    }
    if (REGEX.test(data)) {
      let ext = path.extname(inputPath);
      let outputPath = path.join(dataPath, path.basename(inputPath, ext) + SUFFIX + ext);
      console.log("Converted: " + inputPath + " >> " + outputPath);
      let result = data.replace(REGEX, inline);
      fs.writeFile(outputPath, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }

  });
}



// var childProcess = require('child_process');

// console.log("process.cwd() = " + process.cwd());
// childProcess.exec('npm start', (err, stdout) => {
//     if (err) 
//         console.log(err);

//     console.log(stdout);
// })



