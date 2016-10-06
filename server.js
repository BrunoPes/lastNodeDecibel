var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs = require("fs");
const env = process.env;

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));

// definindo diretorio raiz
app.use(express.static(__dirname + "/public")); 

app.route('/write')
    .post(function(req, res){
        var data = req.body.data;
        console.log(data);
        var time = new Date();
        var fileName = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
        var path = __dirname + "/data/" + fileName + '.txt';

        fs.access(path, (error) => {
            if(error)
                fs.open(path, "w", function(error){
                    if(error)
                        console.log(error);
                });

            fs.readFile(path, "utf8", function(err, oldData) {
                if(err)
                    return;
                newFile = data + "\n" + oldData;
                fs.writeFile(path, newFile, (err) => {
                    if(err)
                        return;
                });
                res.sendStatus(200);
                res.end();
            });
            // fs.appendFile(path, data + "\n");
        });
    });

app.route('/read')
    .post(function(req, res){
        var data = "";
        var time = new Date();
        var fileName = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
        var path = __dirname + "/data/" + fileName + '.txt';

        fs.access(path, (error) => {
            if(error) {
                fs.open(path, "w", function(error){
                    if(error) {
                        console.log(error);
                        return;
                    }
                });
            } else {
                fs.readFile(path, "utf8", function(err, data) {
                    if(err) {
                        return;
                    }
                    var dt = data.split("\n");
                    res.send({ data: dt });
                    res.end();
                });
            }
        });
    });

app.route('/health').
    get(function(req, res) {
        res.writeHead(200);
        res.end();
    });

app.route('*')
    .get(function(req, res){
        var options = {
            root: __dirname + "/public/",
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        res.sendFile('index.html', options, function(error){
            if(error) throw error;
        });        
   });

app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function(){
    console.log("Listening port yes");
});
