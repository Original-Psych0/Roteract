//Dependencies
const Readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
})
const Columnify = require("columnify")
const Chalk = require("chalk")
const Path = require("path")
const Fs = require("fs")

//Variables
var Plugins = []

var Self = {
    use: ">"
}

//Functions
function directory_files(dir, done) {
    var results = []

    Fs.readdir(dir, function (err, list) {
        if (err) return done(err)

        var list_length = list.length

        if (!list_length) return done(null, results)

        list.forEach(function (file) {
            file = Path.resolve(dir, file)

            Fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    directory_files(file, function (err, res) {
                        results = results.concat(res)

                        if (!--list_length) done(null, results)
                    })
                } else {
                    var is_js = false

                    if(file.indexOf("main.js") != -1){
                        is_js = true
                    }

                    if(is_js){
                        results.push(file)
                    }
                    
                    if (!--list_length) done(null, results)
                }
            })
        })
    })
}

Self.print_random_banner = function(){
    require("./modules/banners.js").self()
}

Self.information = function(){
    console.log(Chalk.rgb(57, 107, 215)(`―――――─━[ Developed by Psych0 ]━─―――――
――――─━[    Roteract v1.0.0     ]━─――――
―――─━[    ${Plugins.length} plugins loaded      ]━─―――`))
}

Self.parse_plugins = async function(){
    return new Promise((resolve, reject)=>{
        for( i in Plugins ){
            Plugins[i] = Plugins[i].replace(`${__dirname}\\plugins\\`, "")
            Plugins[i] = Plugins[i].replace(/\\main.js/, "")
            Plugins[i] = Plugins[i].replace(/\\/, "/")
        }

        resolve()
    })
}

Self.use_handler = function(command_args, back_type){
    if(!command_args[1]){
        console.log("Usage: use <plugin>")
        
        if(back_type == "navigation"){
            Self.navigation()
        }else if(back_type == "use_navigation"){
            Self.use_navigation()
        }

        return
    }

    if(Plugins.indexOf(command_args[1]) == -1){
        console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to use the plugin, please make sure It's valid.`)

        if(back_type == "navigation"){
            Self.navigation()
        }else if(back_type == "use_navigation"){
            Self.use_navigation()
        }

        return
    }

    if(back_type == "navigation"){
        if(Plugins.indexOf(command_args[1]) != -1){
            Self.use = `${command_args[1]}>`
            Self.use_navigation(require(Path.resolve(`${__dirname}\\plugins`, command_args[1], "main.js")).information(), command_args[1])
            return
        }else{
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to use the plugin, please check If It's valid.`)
            Self.use_navigation(require(Path.resolve(`${__dirname}\\plugins`, command_args[1], "main.js")).information(), command_args[1])
            return
        }
    }else if(back_type == "use_navigation"){
        if(Plugins.indexOf(command_args[1]) != -1){
            Self.use = `${command_args[1]}>`
            Self.use_navigation(require(Path.resolve(`${__dirname}\\plugins`, command_args[1], "main.js")).information(), command_args[1])
            return
        }else{
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to use the plugin, please check If It's valid.`)
            Self.navigation()
            return
        }
    }
}

Self.use_navigation = function(plugin_information, module_sp){
    var options = plugin_information.options

    Object.keys(options).forEach(key =>{
        var value = options[key]

        delete options[key]

        options[key.toUpperCase()] = value
    })

    Readline.question(`${Chalk.rgb(122, 223, 242)("roteract")} {${Self.use}} `, command =>{
        const command_args = command.split(" ")

        if(command == "help"){
            console.log(`
    Command             Description
    ┉┉┉┉┉┉┉             ┉┉┉┉┉┉┉┉┉┉┉
    help                Help menu
    options             Show plugin options
    use                 Use specific plugin in plugins
    run                 Run the plugin with your settings
    set                 Set a value to the specific variable in the used plugin
    search              Search for plugins that matched your keyword
    clear               Clear the console
    exit                Exit Roteract
            `)
            Self.use_navigation(plugin_information)
            return
        }else if(command == "run"){
            var temp_options = options

            Object.keys(temp_options).forEach(key =>{
                var value = temp_options[key]
        
                delete temp_options[key]
        
                temp_options[key.toLowerCase()] = value
            })

            handler()

            async function handler(){
                await require(`${__dirname}\\plugins\\${Self.use.replace(">", "")}\\main.js`).main(temp_options).then(function(callback){
                    Self.use_navigation(plugin_information)
                    return
                })
            }

            return
        }else if(command_args[0] == "set"){
            if(!command_args[1]){
                console.log("Usage: set <variable> <value>")
                Self.use_navigation(plugin_information)
                return
            }

            if(!command_args[2]){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to set the value to the variable, please check if the variable is valid.`)
                Self.use_navigation(plugin_information)
                return
            }

            if(options[command_args[1]] != undefined){
               options[command_args[1]] = command_args[2]

               console.log(`[${Chalk.rgb(108, 153, 187)("!")}] ${command_args[1]} => ${command_args[2]}`)
               Self.use_navigation(plugin_information)
               return
            }else{
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unable to set the value to the variable, please check if the variable is valid.`)
                Self.use_navigation(plugin_information)
                return
            }
        }else if(command == "options"){
            console.log("")
            console.log(Columnify(options, {
                minWidth: 15,
                columns: ["Variable", "Value"],
                config: {
                    "Variable": {
                        headingTransform: function(){
                            return "Variable"
                        }
                    },
                    "Value": {
                        headingTransform: function(){
                            return "Value"
                        }
                    }
                }
            }))
            console.log("")
            Self.use_navigation(plugin_information)
            return
        }else if(command == "clear"){
            console.clear()
            Self.use_navigation(plugin_information)
            return
        }else if(command == "exit"){
            console.clear()
            process.exit()
        }else if(command_args[0] == "use"){
            Self.use_handler(command_args, "navigation")
        }else if(command_args[0] == "search"){
            if(!command_args[1]){
                console.log("Usage: search <keyword>")
                Self.use_navigation(plugin_information)
                return
            }
            
            command_args[1] = command_args[1].toLowerCase()

            var matched_plugins = []

            for( i in Plugins ){
                var result = {
                    highlighted: null,
                    full_path: null
                }

                result.full_path = Path.resolve(`${__dirname}\\plugins`, Plugins[i], "main.js")
                result.description = require(result.full_path).information().description()
                result.working = require(result.full_path).information().working
                result.rate = require(result.full_path).information().rate
                result.date = require(result.full_path).information().date
                result.authors = require(result.full_path).information().authors

                if(Plugins[i].indexOf(command_args[1]) != -1){
                    var splitted = Plugins[i].split("/")

                    for( i in splitted ){
                        if(splitted[i] == command_args[1]){
                            splitted[i] = Chalk.rgb(255, 0, 128)(splitted[i])
                        }
                    }

                    for( i in splitted ){
                        if(!result.highlighted){
                            result.highlighted = splitted[i]
                        }else{
                            result.highlighted += `/${splitted[i]}`
                        }
                    }

                    if(JSON.stringify(result).indexOf("[") != -1){
                        matched_plugins.push(result)
                    }
                }
            }
            if(!matched_plugins.length){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] No plugins found using the keyword you specified.`)
                Self.use_navigation(plugin_information)
                return
            }
            
            console.log("")
            console.log(Columnify(matched_plugins, {
                minWidth: 15,
                config: {
                    "highlighted": {
                        headingTransform: function(){
                            return "Use"
                        }
                    },
                    "working": {
                        headingTransform: function(){
                            return "Working"
                        }
                    },
                    "rate": {
                        headingTransform: function(){
                            return "Rate"
                        }
                    },
                    "description": {
                        headingTransform: function(){
                            return "Description"
                        }
                    },
                    "authors": {
                        headingTransform: function(){
                            return "Authors"
                        }
                    },
                    "date": {
                        headingTransform: function(){
                            return "Date"
                        }
                    }
                },
                columns: ["highlighted", "working", "rate", "description", "authors", "date"]
            }))

            console.log("")
            Self.use_navigation(plugin_information)
            return
        }else{
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unknown command.`)
            Self.use_navigation(plugin_information)
            return
        }
    })
}

Self.navigation = function(){
    Readline.question(`${Chalk.rgb(122, 223, 242)("roteract")} {${Self.use}} `, command =>{
        const command_args = command.split(" ")

        if(command == "help"){
            console.log(`
    Command             Description
    ┉┉┉┉┉┉┉             ┉┉┉┉┉┉┉┉┉┉┉
    help                Help menu
    use                 Use specific plugin in plugins
    search              Search for plugins that matched your keyword
    clear               Clear the console
    exit                Exit Roteract
            `)
            Self.navigation()
            return
        }else if(command == "clear"){
            console.clear()
            Self.navigation()
            return
        }else if(command == "exit"){
            console.clear()
            process.exit()
        }else if(command_args[0] == "use"){
            Self.use_handler(command_args, "navigation")
        }else if(command_args[0] == "search"){
            if(!command_args[1]){
                console.log("Usage: search <keyword>")
                Self.navigation()
                return
            }
            
            command_args[1] = command_args[1].toLowerCase()

            var matched_plugins = []

            for( i in Plugins ){
                var result = {
                    highlighted: null,
                    full_path: null
                }

                result.full_path = Path.resolve(`${__dirname}\\plugins`, Plugins[i], "main.js")
                result.description = require(result.full_path).information().description()
                result.working = require(result.full_path).information().working
                result.rate = require(result.full_path).information().rate
                result.date = require(result.full_path).information().date
                result.authors = require(result.full_path).information().authors

                if(Plugins[i].indexOf(command_args[1]) != -1){
                    var splitted = Plugins[i].split("/")

                    for( i in splitted ){
                        if(splitted[i] == command_args[1]){
                            splitted[i] = Chalk.rgb(255, 0, 128)(splitted[i])
                        }
                    }

                    for( i in splitted ){
                        if(!result.highlighted){
                            result.highlighted = splitted[i]
                        }else{
                            result.highlighted += `/${splitted[i]}`
                        }
                    }

                    if(JSON.stringify(result).indexOf("[") != -1){
                        matched_plugins.push(result)
                    }
                }
            }
            if(!matched_plugins.length){
                console.log(`[${Chalk.rgb(255, 0, 128)("!")}] No plugins found using the keyword you specified.`)
                Self.navigation()
                return
            }
            
            console.log("")
            console.log(Columnify(matched_plugins, {
                minWidth: 15,
                config: {
                    "highlighted": {
                        headingTransform: function(){
                            return "Use"
                        }
                    },
                    "working": {
                        headingTransform: function(){
                            return "Working"
                        }
                    },
                    "rate": {
                        headingTransform: function(){
                            return "Rate"
                        }
                    },
                    "description": {
                        headingTransform: function(){
                            return "Description"
                        }
                    },
                    "authors": {
                        headingTransform: function(){
                            return "Authors"
                        }
                    },
                    "date": {
                        headingTransform: function(){
                            return "Date"
                        }
                    }
                },
                columns: ["highlighted", "working", "rate", "description", "authors", "date"]
            }))

            console.log("")
            Self.navigation()
            return
        }else{
            console.log(`[${Chalk.rgb(255, 0, 128)("!")}] Unknown command.`)
            Self.navigation()
            return
        }
    })
}

Self.init = async function(){
    await Self.parse_plugins()

    Self.print_random_banner()
    Self.information()

    console.log("")
    Self.navigation()
}

//Main
directory_files("./plugins", function(err, results){
    if(err){
        console.log(err)
        process.exit()
    }

    Plugins = results

    Self.init()
})
