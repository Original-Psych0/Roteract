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
        name: "Roblox: User friends",
        description: function(){
            return `Retrieves user friends lists.`
        },
        date: "2021-9-30",
        working: "✓",
        rate: "good",
        options: {
            user_id: 0,
            output: "none"
        },
        authors: "I2rys",
        licence: "MIT"
    }
}

Self.user_id_exists = function(user_id, callback){
    Request.get(`https://api.roblox.com/users/${user_id}/friends`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
        }
    }, function(err, res, body){
        if(err){
            callback("swr", body)
            return
        }

        if(body.indexOf('"errors"') != -1){
            callback(false, body)
        }else{
            callback(true, JSON.parse(body))
        }
    })
}

Self.main = async function(options, callback){
    return new Promise((resolve, reject)=>{
        if(!typeof(options.user_id) == "number"){
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Variable USER_ID should be a number not others.`)
            resolve()
            return
        }

        if(!typeof(options.output) == "string"){
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Variable OUTPUT should be a string not others.`)
            resolve()
            return
        }

        console.log(`[${Chalk.rgb(108, 153, 187)("!")}] Checking if the user exists & Grabbing user friends.`)
        Self.user_id_exists(options.user_id, function(user_exists, results){
            if(user_exists == "swr"){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] It looks like Roblox API is down, please try again later.`)
                resolve()
                return
            }else if(user_exists == true){
                if(options.output.indexOf(".") == -1){
                    console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Variable OUTPUT is invalid. Example: set OUTPUT test.txt`)
                    resolve()
                    return
                }

                console.log(`[${Chalk.rgb(108, 153, 187)("!")}] Saving the results.`)
                Fs.writeFileSync(options.output, JSONHood.getJSONasArrowDiagram(results), "utf8")
                console.log(`[${Chalk.rgb(108, 153, 187)("!")}] Results has been saved to ${Path.resolve(__dirname, options.output)}`)

                resolve()
                return
            }else if(user_exists == false){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to find the user with the id you specified.`)
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