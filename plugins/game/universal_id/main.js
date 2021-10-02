//Dependencies
const JSONHood = require("json-hood")
const Request = require("request")
const Chalk = require("chalk")
const Path = require("path")
const Fs = require("fs")

//Variables
var Self = {}

//Main
Self.information = function(){
    return {
        name: "Roblox: Game universal id",
        description: function(){
            return `Retrieves game universal id.`
        },
        date: "2021-10-1",
        working: "✓",
        rate: "good",
        options: {
            PLACE_ID: 0
        },
        authors: "I2rys",
        licence: "MIT"
    }
}

Self.place_id_exists = function(place_id, callback){
    Request.get(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${place_id}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
        }
    }, function(err, res, body){
        if(err){
            callback("swr", body)
            return
        }

        if(body.indexOf("Error") != -1){
            callback(false, body)
        }else{
            callback(true, JSON.parse(body))
        }
    })
}

Self.main = async function(options, callback){
    return new Promise((resolve, reject)=>{
        if(!typeof(options.user_id) == "number"){
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Variable PLACE_ID should be a number not others.`)
            resolve()
            return
        }

        console.log(`[${Chalk.rgb(108, 153, 187)("!")}] Checking if the place exists & Grabbing the place universal id.`)
        Self.place_id_exists(options.place_id, function(place_exists, results){
            if(place_exists == "swr"){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] It looks like Roblox API is down, please try again later.`)
                resolve()
                return
            }else if(place_exists == true){
                console.log(`[${Chalk.rgb(108, 153, 187)("!")}] Game universal id is ${results.UniverseId}.`)
                resolve()
                return
            }else if(place_exists == false){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to find the place with the id you specified.`)
                resolve()
                return
            }
        })
    })
}

//Exporter
module.exports = {
    information: Self.information,
    main: Self.main
}