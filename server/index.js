const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const XMLHttpRequest = require('xhr2');

const app = express();
const port = 3000;
const secretKey = '4af1c2a3ac259f822e0cf10c16af47c497f12fc3daddacd911ece8a6c027ab69a577a510f52c7d43897932b021a0d6ab77a9f33a7cebbbff5827d6fee88abcfa'; // Replace with your actual generated secret key

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let tokenst = [];

function checktoken(token) {
    return tokenst.includes(token);
}

function maketoken() {
    const token = crypto.randomBytes(16).toString('hex');
    tokenst.push(token);
    return token;
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
    return result;
}

// Serve static files
app.use('/media', express.static('media'));
app.use('/assets', express.static(path.join(__dirname, 'data/assets')));
app.use('/webfiles', express.static(path.join(__dirname, '../client/webfiles')));

// Serve the main menu page
app.get('/menu', (req, res) => {
    fs.readFile('data/menu.html', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        }
    });
});

// Serve the menu data
app.get('/getmenu', (req, res) => {
    fs.readFile('data/menu.json', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            const replacementdata = data;
            fs.readFile('data/menu.html', (err, data) => {
                if (err) {
                    res.send(err);
                } else {
                    const finalData = data.toString().replace("(datarenderplace)", replacementdata.toString());
                    res.send(finalData);
                }
            });
        }
    });
});

// Serve the advertisement page
app.get('/advertisement', (req, res) => {
    fs.readFile('data/advertisement.html', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        }
    });
});

// Serve the news data
app.get('/news', (req, res) => {
    const xmlht = new XMLHttpRequest();
    xmlht.open("GET", "https://www.tagesschau.de/api2/news/?regions=1&ressort=inland", true);
    xmlht.send();
    xmlht.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const news = JSON.parse(this.responseText);
            const newsarray = news.news.slice(0, 16).map(item => ({
                headline: item.title,
                image: item.teaserImage.imageVariants['16x9-1920'],
                firstsentence: item.firstSentence,
                url: item.shareURL
            }));
            fs.readFile('data/news.html', (err, data) => {
                if (err) {
                    res.send(err);
                } else {
                    const finalData = data.toString().replace("(datainsertanchor)", JSON.stringify(newsarray));
                    res.send(finalData);
                }
            });
        }
    };
});

// Serve the admin panel
app.get('/panel', (req, res) => {
    const token = req.cookies.token;
    if (checktoken(token)) {
        res.sendFile(path.join(__dirname, 'data/panel.html'));
    } else {
        res.redirect('/ui/login');
    }
});

// Serve the menu edit page
app.get('/panel/menu', (req, res) => {
    const token = req.cookies.token;
    if (checktoken(token)) {
        fs.readFile('data/menu.json', (err, data) => {
            if (err) {
                res.send(err);
            } else {
                const menu = JSON.parse(data);
                const replacementdata = menu.map(item => 
                    `<tr><td>${item.name}</td><td>${item.price}</td><td>${item.image}</td><td>${item.days}</td><td><a href='/panel/menu/edit/${item.id}'>Bearbeiten</a></td></tr>`
                ).join('');
                fs.readFile('data/menuedit.html', (err, data) => {
                    if (err) {
                        res.send(err);
                    } else {
                        const finalData = data.toString().replace("(renderanchor)", replacementdata);
                        res.send(finalData);
                    }
                });
            }
        });
    } else {
        res.redirect('/ui/login');
    }
});

// Serve the menu item edit page
app.get('/panel/menu/edit/:id', (req, res) => {
    const id = req.params.id;
    const token = req.cookies.token;
    if (checktoken(token)) {
        fs.readFile('data/menu.json', (err, data) => {
            if (err) {
                res.send(err);
            } else {
                const menu = JSON.parse(data);
                const menuitem = menu.find(item => item.id == id);
                if (menuitem) {
                    fs.readFile('data/editentry.html', (err, data) => {
                        if (err) {
                            res.send(err);
                        } else {
                            let replacementdata = data.toString()
                                .replace("(id)", menuitem.id)
                                .replace("(name)", menuitem.name)
                                .replace("(price)", menuitem.price)
                                .replace("(days)", menuitem.days);
                            fs.readdir('media', (err, files) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    const dropdown = files.map(file => `<option value='${file}'>${file}</option>`).join('');
                                    replacementdata = replacementdata.replace("(allimgs)", dropdown);
                                    res.send(replacementdata);
                                }
                            });
                        }
                    });
                } else {
                    res.send("Menu item not found");
                }
            }
        });
    } else {
        res.redirect('/ui/login');
    }
});

// Serve the new menu item page
app.get('/panel/menu/new', (req, res) => {
    const token = req.cookies.token;
    if (checktoken(token)) {
        fs.readFile('data/newentry.html', (err, data) => {
            if (err) {
                res.send(err);
            } else {
                fs.readdir('media', (err, files) => {
                    if (err) {
                        res.send(err);
                    } else {
                        const dropdown = files.map(file => `<option value='${file}'>${file}</option>`).join('');
                        const replacementdata = data.toString().replace("(allimgs)", dropdown);
                        res.send(replacementdata);
                    }
                });
            }
        });
    } else {
        res.redirect('/ui/login');
    }
});

// Handle new menu item creation
app.post('/api/newentry', (req, res) => {
    const id = makeresultid(10);
    const { name, price, image, days } = req.body;
    const newItem = {
        id,
        name,
        price,
        image: `/media/${image}`,
        days
    };

    fs.readFile('data/menu.json', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            const menu = JSON.parse(data);
            menu.push(newItem);
            fs.writeFile('data/menu.json', JSON.stringify(menu), (err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send("success");
                }
            });
        }
    });
});

// Handle menu item editing
app.post('/api/editentry', (req, res) => {
    const { id, name, price, image, days } = req.body;

    fs.readFile('data/menu.json', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            const menu = JSON.parse(data);
            const menuItem = menu.find(item => item.id == id);
            if (menuItem) {
                menuItem.name = name;
                menuItem.price = price;
                menuItem.image = `/media/${image}`;
                menuItem.days = days;
                fs.writeFile('data/menu.json', JSON.stringify(menu), (err) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send("success");
                    }
                });
            } else {
                res.send("error");
            }
        }
    });
});

// Handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'media/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const limits = { fileSize: 3 * 1024 * 1024 };
const upload = multer({ storage: storage, limits: limits });

app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ path: `/media/${req.file.filename}` });
});

// Handle login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile('data/accounts.json', (err, data) => {
        if (err) {
            res.send(err);
        } else {
            const accounts = JSON.parse(data);
            const account = accounts.find(acc => acc.username == username && acc.password == password);
            if (account) {
                const token = maketoken();
                res.send(token);
            } else {
                res.sendStatus(401);
            }
        }
    });
});

app.get("/ui/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'data/login.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});