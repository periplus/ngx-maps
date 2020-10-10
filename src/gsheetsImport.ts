require('isomorphic-fetch');
const fs = require("fs");
let data:object = {};
let gsheets = require('gsheets');
 data = gsheets.getWorksheet('1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A', 'TileServers')
    .then(function (res) {
        let data = JSON.stringify(res, null, 4);
    fs.writeFileSync("gsheetsImport.json", data);
        return console.log("Done"); }, function (err) { return console.error(err); });