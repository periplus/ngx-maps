"use strict";
exports.__esModule = true;
require('isomorphic-fetch');
var _ = require("lodash-es");
var fs = require("fs");
var data = {};
var gsheets = require("gsheets");
var gsheetsUrl = '1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A'; //Id of the TileServers google spreadsheet (https://docs.google.com/spreadsheets/d/1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A/edit?ts=5f7f66a3#gid=0)
var workSheet = "tileServers";
data = gsheets.getWorksheet(gsheetsUrl, workSheet).then(function (response) {
    //const data: TileData = response as TileData;
    response.data = response.data.filter(function (elem) { return elem.enabled === "yes" || elem.enabled === "TRUE"; });
    var a = "";
    a.replace[Symbol];
    _;
    response.data.forEach(function (elem) {
        delete elem.latency, delete elem.provider;
        delete elem.enabled, delete elem.description; //Yes, for sure there is a better way. Calling 'delete' on an array which is made up of all the element we want to get rid of.
        delete elem.IPv6, delete elem.tileUrlSample;
        delete elem.sourceCode, delete elem.language;
    });
    fs.writeFileSync("./src/assets/tile-sources.json", JSON.stringify(response, null, 4));
    return console.debug("Import complete");
}, function (err) {
    return console.erro