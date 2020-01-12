#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const inputExt = "csv";
const imageExt = "jpg,png,gif";
const SUFFIX = "_converted";

const regex = RegExp('inline\\\(([^\)]+)\\\)', 'g');

const dataPath = "./data";


glob(dataPath + "/*." + inputExt, function (er, files) {
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
      let files = glob.sync(dataPath + "/**/" + imageName + ".{" + imageExt + "}");
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
    if (regex.test(data)) {
      let ext = path.extname(inputPath);
      let outputPath = path.join(dataPath, path.basename(inputPath, ext) + SUFFIX + ext);
      console.log("Converted: " + inputPath + " >> " + outputPath);
      let result = data.replace(regex, inline);
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



