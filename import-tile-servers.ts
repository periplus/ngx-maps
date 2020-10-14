require ('isomorphic-fetch');
const _ = require("lodash-es");
const fs = require("fs");
let data:object = {};
import * as gsheets from "gsheets";
const gsheetsUrl:string ='1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A'; //Id of the TileServers google spreadsheet (https://docs.google.com/spreadsheets/d/1SE6wf-cD2vvWMUq7gYx-QFD7ZUit-wSh4DaRq3vY61A/edit?ts=5f7f66a3#gid=0)
const workSheet:string = "tileServers"  ;                                 
interface TileData {
    data: Array<any>;
    
}



data = gsheets.getWorksheet(gsheetsUrl, workSheet).then((response: TileData) => {                            
    //const data: TileData = response as TileData;
    response.data = response.data.filter(elem  => elem.enabled === "yes" || elem.enabled === "TRUE");
    let a : string = "";
    a.replace[Symbol]_
    response.data.forEach(elem => {
        delete elem.latency, delete elem.provider;
        delete elem.enabled, delete elem.description; //Yes, for sure there is a better way. Calling 'delete' on an array which is made up of all the element we want to get rid of.
        delete elem.IPv6, delete elem.tileUrlSample;
        delete elem.sourceCode, delete elem.language;
        
        
    });
    fs.writeFileSync("./src/assets/tile-sources.json", JSON.stringify(response, null, 4));
    return console.debug("Import complete"); }, function (err) { return console.error(err);
});