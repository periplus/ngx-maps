require ('isomorphic-fetch');
const fs = require("fs");
let data:object = {};
let gsheets = require('gsheets');
 data = gsheets.getWorksheet('1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A', 'tileServers')  // The first string is the id of the TileServers google spreadsheet,  while the seccond is the name of the sheet, see:
    .then(function (res) {                                                                   //https://docs.google.com/spreadsheets/d/1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A/edit?ts=5f7f66a3#gid=0
        let data = JSON.stringify(res, null, 4);
    fs.writeFileSync("./src/assets/tile-sources.json", data);
        return console.log("Done"); }, function (err) { return console.error(err); });