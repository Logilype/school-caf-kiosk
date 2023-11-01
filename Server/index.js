const express = require('express');
fs = require('fs');
var XMLHttpRequest = require('xhr2');
const multer = require('multer');

const app = express();
const port = 3000;
app.use(express.urlencoded());
const cookieParser = require("cookie-parser");

app.use(cookieParser());

tokenst = [];

app.get('/', (req, res) => res.send('i dont get paid enough for this'));

//set media as static folder
app.use('/media', express.static('media'));

app.get('/getmenu', (req, res) => {

    fs.readFile('data/menu.json', (err, data) => {
        if (err) {
            res.send(err);
        };
        replacementdata = data
        fs.readFile('data/menu.html', (err, data) => {
            if (err) {
                res.send(err);
            };
            replacementdata = data.toString().replace("(datarenderplace)", replacementdata.toString());
            res.send(replacementdata);
        });
    });
});

app.get('/getdisplaysequence', (req, res) => {
    res.sendFile(__dirname + '/data/displayseq.json');
    
});

app.get('/news', (req, res) => {
    xmlht = new XMLHttpRequest();
    xmlht.open("GET", "https://www.tagesschau.de/api2/news/?regions=1&ressort=inland", true);
    xmlht.send();
    xmlht.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //for every news item make a new json object with the title, image, firstSentence and shareurl
            var news = JSON.parse(this.responseText);
            var newsarray = [];
            for (var i = 0; i < 16; i++) {
                var newsitem = {
                    headline: news.news[i].title,
                    image: news.news[i].teaserImage.imageVariants['16x9-1920'],
                    firstsentence: news.news[i].firstSentence,
                    url: news.news[i].shareURL
                };
                newsarray.push(newsitem);
            }
            //send the array as json
            fs.readFile('data/news.html', (err, data) => {
                if (err) {
                    res.send(err);
                };
                replacementdata = data.toString().replace("(datainsertanchor)", JSON.stringify(newsarray));
                res.send(replacementdata);
            });
        }
    };
    
});

app.get('/panel', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send panel.html
        res.sendFile(__dirname + '/data/panel.html');
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});
app.get('/panel/upload', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send panel.html
        res.sendFile(__dirname + '/data/uploadmedia.html');
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});
app.get('/panel/menu', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send panel.html
        // render out data from menu.json and insert it into the html table
        fs.readFile('data/menu.json', (err, data) => {
            if (err) {
                res.send(err);
            };
            replacementdata = ""
            var menu = JSON.parse(data);
            for (var i = 0; i < menu.length; i++) {
                replacementdata = replacementdata + "<tr><td>" + menu[i].name + "</td><td>" + menu[i].price + "</td><td>" + menu[i].image + "</td><td>" + menu[i].days + "</td><td><a href='/panel/menu/edit/" + menu[i].id + "'>Bearbeiten</a></td></tr>";
            }

            fs.readFile('data/menuedit.html', (err, data) => {
                if (err) {
                    res.send(err);
                };
                replacementdata = data.toString().replace("(renderanchor)", replacementdata.toString());
                res.send(replacementdata);
            });
        });
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //make directory with id
        
        cb(null, 'media/');
    },
    filename: (req, file, cb) => {
        filename = "/media/" + file.originalname;
        
        cb(null, file.originalname);

    }
});
//limit upload size to 3mb
const limits = {
    fileSize: 3 * 1024 * 1024,
};


const upload = multer({ storage: storage, limits: limits});

app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ path: filename });
});


app.get('/panel/menu/edit/:id', (req, res) => {
    //get token from cookies and check if it is valid
    id = req.params.id;
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send panel.html
        // get id from menu.json and send raw data to the user
        fs.readFile('data/menu.json', (err, data) => {
            if (err) {
                res.send(err);
            };
            var menu = JSON.parse(data);
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id == id) {
                    menuitem = menu[i];
                    fs.readFile('data/editentry.html', (err, data) => {
                        if (err) {
                            res.send(err);
                        };
                        replacementdata = data.toString().replace("(id)", menuitem.id);
                        replacementdata = replacementdata.toString().replace("(name)", menuitem.name);
                        replacementdata = replacementdata.toString().replace("(price)", menuitem.price);
                        
                        replacementdata = replacementdata.toString().replace("(days)", menuitem.days);
                        //index all files in media folder and add them to the dropdown
                        fs.readdir('media', (err, files) => {
                            if (err) {
                                res.send(err);
                            };
                            var dropdown = "";
                            for (var i = 0; i < files.length; i++) {
                                dropdown = dropdown + "<option value='" + files[i] + "'>" + files[i] + "</option>";
                            }
                            replacementdata = replacementdata.toString().replace("(allimgs)", dropdown);
                            res.send(replacementdata);
                        });
                    });
                    return;
                }
            }
            res.send("error");
        });
        
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});

app.post('/api/editentry', (req, res) => {
    // get username and pw from form data
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var days = req.body.days;
    console.log(id);
    console.log(name);
    console.log(price);
    console.log(image);
    console.log(days);
    

    //edit entry in menu.json with the id from the parameters
    fs.readFile('data/menu.json', (err, data) => {
        if (err) {
            res.send(err);
        };
        var menu = JSON.parse(data);
        for (var i = 0; i < menu.length; i++) {
            if (menu[i].id == id) {
                menu[i].name = name;
                menu[i].price = price;
                menu[i].image = image;
                menu[i].days = days;
                fs.writeFile('data/menu.json', JSON.stringify(menu), (err) => {
                    if (err) {
                        res.send(err);
                    };
                    res.send("success");
                });
                return;
            }
        }
        res.send("error");
    });
});

app.post('/api/login', (req, res) => {
    // get username and pw from form data
    var username = req.body.username;
    var password = req.body.password;
    //check if username and pw are correct
    //read accounts.json
    fs.readFile('data/accounts.json', (err, data) => {
        if (err) {
            res.send(err);
        };
        //parse json
        var accounts = JSON.parse(data);
        //check if username and pw are correct
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].username == username && accounts[i].password == password) {
                //if correct make a token and send it to the user
                var token = maketoken();
                res.send(token);
                return;
            }
        }
        //if not correct send error
        res.sendStatus(401);
    });
});
app.get("/ui/login", (req, res) => {
    res.sendFile(__dirname + '/data/login.html');
});

function maketoken() {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 32; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    tokenst.push(token);
    return token;
}

function checktoken(token) {
    for (var i = 0; i < tokenst.length; i++) {
        if (tokenst[i] == token) {
            return true;
        }
    }
    return false;
}


app.listen(port, () => console.log(`Server listening on port ${port}!`));