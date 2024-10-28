const express = require('express');
var XMLHttpRequest = require('xhr2');
const fs = require('fs');
const multer = require('multer');
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json());
app.use(express.static('data'));

tokenst = [];

app.get('/', (req, res) => res.send('i dont get paid enough for this'));

// Set media as static folder
app.use('/media', express.static('media'));

// Endpoint to serve settings page
app.get('/panel/settings', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send settings.html
        res.sendFile(__dirname + '/data/settings.html');
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
});

// Endpoint to get current settings
app.get('/api/settings', (req, res) => {
    fs.readFile('data/settings.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading settings file:', err);
            return res.status(500).send('Error reading settings');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update settings
app.post('/api/settings', (req, res) => {
    const updatedSettings = req.body;
    fs.writeFile('data/settings.json', JSON.stringify(updatedSettings, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing settings file:', err);
            return res.status(500).send('Error saving settings');
        }
        res.send('Settings updated successfully');
    });
});

app.get('/getoffers', (req, res) => {
    fs.readFile('data/offers.json', (err, data) => {
        if (err) {
            return res.send(err);
        }

        // Parse the JSON data
        let menuItems = JSON.parse(data);

        // Filter the items where visibility is true
        let visibleItems = menuItems.filter(item => item.visibility);

        // Convert the filtered data back to JSON
        let replacementdata = JSON.stringify(visibleItems, null, 2);

        fs.readFile('data/offers.html', (err, data) => {
            if (err) {
                return res.send(err);
            }

            // Replace the placeholder with the filtered menu data
            let renderedData = data.toString().replace("(datarenderplace)", replacementdata);
            res.send(renderedData);
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
    intent = req.query.intent;
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send panel.html
        res.sendFile(__dirname + '/data/panel.html');
        console.log(intent);
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
        //if valid send uploadmedia.html
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
            //if valid send menuedit.html
            res.sendFile(__dirname + '/data/menuedit.html');
        } else {
            //if not valid send login.html
            res.redirect('/ui/login');
        }
});
app.get('/panel/media', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send media.html
        //index all files in media folder and add them to the table
        fs.readdir('media', (err, files) => {
            if (err) {
                res.send(err);
            }
            replacementdata = ""
            for (var i = 0; i < files.length; i++) {
                replacementdata = replacementdata + "<tr><td>" + files[i] + "</td><td><img src='/media/"+ files[i] +"' style='max-width: 200px; max-height: 200px;'></img></td></tr>";
            }
            fs.readFile('data/media.html', (err, data) => {
                if (err) {
                    res.send(err);
                };
                replacementdata = data.toString().replace("(renderanchor)", replacementdata.toString());
                res.send(replacementdata);
            });
        }
        );
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});
app.get('/panel/offers', (req, res) => {
    var token = req.cookies.token;
    if (checktoken(token)) {
        fs.readFile('data/offers.json', (err, data) => {
            if (err) {
                return res.status(500).send(err);
            }
            const menu = JSON.parse(data);
            const entries = menu.map(item => `
                <div class="grid-item">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">${item.price}</p>
                    <div class="image-container">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <p class="item-days">${item.days}</p>
                    <p class="item-visibility ${item.visibility ? '' : 'inactive'}">${item.visibility ? 'Aktiv' : 'Inaktiv'}</p> <!-- Visibility indicator -->
                    <div class="buttons">
                        <button type="button" onclick="openEditModal({ id: '${item.id}', name: '${item.name}', price: '${item.price}', image: '${item.image}', days: '${item.days}', visibility: ${item.visibility} })">Bearbeiten</button>
                        <button onclick="deleteEntry(${item.id})">Löschen</button>
                    </div>
                </div>
            `).join('');
            
            const html = fs.readFileSync('data/offersedit.html', 'utf8').replace('(renderanchor)', entries);
            res.send(html);
        });
    } else {
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


app.get('/panel/offers/new', (req, res) => {
    //get token from cookies and check if it is valid
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        //if valid send newentry.html
        fs.readFile('data/newentry.html', (err, data) => {
            if (err) {
                res.send(err);
            };
            //index all files in media folder and add them to the dropdown
            fs.readdir('media', (err, files) => {
                if (err) {
                    res.send(err);
                };
                var dropdown = "";
                for (var i = 0; i < files.length; i++) {
                    dropdown = dropdown + "<option value='" + files[i] + "'>" + files[i] + "</option>";
                }
                replacementdata = data.toString().replace("(allimgs)", dropdown);
                res.send(replacementdata);
            });
        });
    } else {
        //if not valid send login.html
        res.redirect('/ui/login');
    }
    
});

app.post('/api/newentry', (req, res) => {
    var id = makeresultid(10);
    var name = req.body.name;
    var price = req.body.price;
    var image = "/media/" + req.body.image;
    var days = req.body.days;
    var visibility = req.body.visibility || true; // Default to true if not provided

    // Log the received data
    console.log(id, name, price, image, days, visibility);

    // Edit entry in offers.json with the id from the parameters
    fs.readFile('data/offers.json', (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        var menu = JSON.parse(data);

        menu.push({
            id: id,
            name: name,
            price: price,
            image: image,
            days: days,
            visibility: visibility // Add visibility property
        });

        fs.writeFile('data/offers.json', JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.send("success");
        });
    });
});


app.post('/api/editentry', (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image; // Get the image path directly from the request
    var days = req.body.days;
    var visibility = req.body.visibility; // Get the visibility state from the request

    // Log the received data
    console.log("Received data:", req.body);

    // Edit entry in offers.json with the id from the parameters
    fs.readFile('data/offers.json', (err, data) => {
        if (err) {
            return res.status(500).send(err); // Send error response if reading fails
        }
        var menu = JSON.parse(data);
        for (var i = 0; i < menu.length; i++) {
            if (menu[i].id == id) {
                menu[i].name = name;
                menu[i].price = price;
                menu[i].image = image; // Save the image path directly
                menu[i].days = days;
                menu[i].visibility = visibility; // Save the visibility state
                fs.writeFile('data/offers.json', JSON.stringify(menu, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send(err); // Send error response if writing fails
                    }
                    res.send("success"); // Send success response
                });
                return;
            }
        }
        res.send("error"); // Send error if id not found
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

function makeresultid(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result
}

app.post('/api/deleteentry', (req, res) => {
    const id = req.body.id;
    console.log('Request body:', req.body);
    console.log(`Received request to delete entry with id: ${id}`);

    fs.readFile('data/offers.json', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send(err);
        }

        let menu = JSON.parse(data);
        const initialLength = menu.length;
        menu = menu.filter(item => String(item.id) !== String(id));
        console.log(`Entries before deletion: ${initialLength}, after deletion: ${menu.length}`);

        fs.writeFile('data/offers.json', JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error('Error writing to offers.json:', err);
                return res.status(500).send(err);
            }
            res.send("success");
        });
    });
});

app.get('/api/getImages', (req, res) => {
    fs.readdir('media', (err, files) => {
        if (err) {
            console.error('Error reading media directory:', err);
            return res.status(500).send(err);
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
        const imagePaths = imageFiles.map(file => `/media/${file}`); // Create full paths
        res.json(imagePaths); // Send the list of image paths as JSON
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

