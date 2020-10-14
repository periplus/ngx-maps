require ('isomorphic-fetch');
const fs = require("fs");
let data:object = {};
let gsheets = require('gsheets');
let gsheetsUrl:string ='1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A'; //Id of the TileServers google spreadsheet (https://docs.google.com/spreadsheets/d/1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A/edit?ts=5f7f66a3#gid=0)
let workSheet:string = "tileServers"                                   

data = gsheets.getWorksheet(gsheetsUrl, workSheet).then(function (res) {                            
    let data = JSON.stringify(res, null, 4);
    fs.writeFileSync("./src/assets/tile-sources.json", data);
        return console.debug("Import complete"); }, function (err) { return console.error(err); });