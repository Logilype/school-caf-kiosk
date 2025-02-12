const express = require('express');
var XMLHttpRequest = require('xhr2');
const fs = require('fs');
const multer = require('multer');
const cookieParser = require("cookie-parser");
const path = require('path');

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json());
app.use(express.static('data'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// If your fonts are in a different directory, add another static middleware
app.use('/media/fonts', express.static(path.join(__dirname, 'data/fonts')));

// Update static file serving middleware
app.use('/dashboard', express.static(path.join(__dirname, 'data/dashboard')));

// Update font serving middleware
app.use('/dashboard/fonts', express.static(path.join(__dirname, 'data/dashboard/fonts')));

// Update media serving middleware
app.use('/dashboard/assets', express.static(path.join(__dirname, 'data/dashboard/assets')));

tokenst = [];

app.get('/', (req, res) => {
    // Check if user is logged in by verifying token
    var token = req.cookies.token;
    if (checktoken(token)) {
        // If logged in, redirect to dashboard home
        res.redirect('/panel');
    } else {
        // If not logged in, redirect to login page
        res.redirect('/ui/login');
    }
});

// Set media as static folder

app.use('/media', express.static('media'));

// Endpoint to serve settings page
app.get('/panel/settings', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/settings.html');
    } else {
        res.redirect('/ui/login');
    }
});

// Endpoint to get current settings
app.get('/api/settings', (req, res) => {
    fs.readFile('data/configs/settings.json', 'utf8', (err, data) => {
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
    fs.writeFile('data/configs/settings.json', JSON.stringify(updatedSettings, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing settings file:', err);
            return res.status(500).send('Error saving settings');
        }
        res.send('Settings updated successfully');
    });
});

app.get('/getoffers', (req, res) => {
    fs.readFile('data/configs/offers.json', (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(JSON.parse(data));
    });
});

app.get('/getdisplaysequence', (req, res) => {
    res.sendFile(__dirname + '/data/configs/displayseq.json');
    
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
    const intent = req.query.intent;
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/panel.html');
        if (intent !== undefined) {
            console.log(intent);
        }
    } else {
        res.redirect('/ui/login');
    }
});
app.get('/panel/upload', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/uploadmedia.html');
    } else {
        res.redirect('/ui/login');
    }
});
    
app.get('/panel/menu', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/menuedit.html');
    } else {
        res.redirect('/ui/login');
    }
});
app.get('/panel/media', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        const mediaDir = path.join(__dirname, 'media');
        
        fs.readdir(mediaDir, (err, files) => {
            if (err) {
                console.error('Error reading media directory:', err);
                return res.status(500).send('Error loading media');
            }

            const imageEntries = files.map(file => `
                <tr>
                    <td>${file}</td>
                    <td><img src="/media/${file}" alt="${file}" style="width: 100px;"></td>
                    <td><button onclick="deleteImage('${file}')">Löschen</button></td>
                </tr>
            `).join('');

            fs.readFile(path.join(__dirname, 'data/dashboard', 'media.html'), 'utf8', (err, html) => {
                if (err) {
                    console.error('Error reading media.html:', err);
                    return res.status(500).send('Error loading page');
                }

                const updatedHtml = html.replace('(renderanchor)', imageEntries);
                res.send(updatedHtml);
            });
        });
    } else {
        res.redirect('/ui/login');
    }
});

app.get('/panel/offers', (req, res) => {
    var token = req.cookies.token;
    if (checktoken(token)) {
        fs.readFile('data/configs/offers.json', (err, data) => {
            if (err) {
                return res.status(500).send(err);
            }
            const menu = JSON.parse(data);
            const entries = menu.map(item => `
                <div class="grid-item">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">${item.price.toFixed(2).replace('.', ',')}&nbsp;€</p>
                    <div class="image-container">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <p class="item-days">${item.days}</p>
                    <p class="item-visibility ${item.visibility ? '' : 'inactive'}">${item.visibility ? 'Wird angezeigt' : 'Wird nicht angezeigt'}</p>
                    <div class="buttons">
                        <button type="button" onclick="openEditModal({ id: '${item.id}', name: '${item.name}', price: '${item.price}', image: '${item.image}', days: '${item.days}', visibility: ${item.visibility} })">Bearbeiten</button>
                        <button onclick="deleteEntry(${item.id})">Löschen</button>
                    </div>
                </div>
            `).join('');
            
            const html = fs.readFileSync('data/dashboard/offersedit.html', 'utf8').replace('(renderanchor)', entries);
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
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        fs.readFile('data/dashboard/newofferentry.html', (err, data) => {
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
        res.redirect('/ui/login');
    }
});

app.post('/api/newentry', (req, res) => {
    const { name, price, image, days } = req.body;
    const id = makeresultid(10); // Generate a new ID

    // Ensure the image path is correctly prefixed
    const imagePath = image.startsWith('/media/') ? image : `/media/${image}`;

    fs.readFile('data/configs/offers.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send('Error reading offers');
        }

        let offers = JSON.parse(data);
        offers.push({
            id,
            name,
            price,
            image: imagePath, // Use the corrected image path
            days,
            visibility: true // Default visibility to true
        });

        fs.writeFile('data/configs/offers.json', JSON.stringify(offers, null, 2), (err) => {
            if (err) {
                console.error('Error writing to offers.json:', err);
                return res.status(500).send('Error saving new offer');
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
    fs.readFile('data/configs/offers.json', (err, data) => {
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
                fs.writeFile('data/configs/offers.json', JSON.stringify(menu, null, 2), (err) => {
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
    fs.readFile('data/configs/accounts.json', (err, data) => {
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
    res.sendFile(__dirname + '/data/dashboard/login.html');
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

app.post('/api/deleteoffer', (req, res) => {
    const id = req.body.id;
    console.log('Request body:', req.body);
    console.log(`Received request to delete entry with id: ${id}`);

    fs.readFile('data/configs/offers.json', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send(err);
        }

        let menu = JSON.parse(data);
        const initialLength = menu.length;
        menu = menu.filter(item => String(item.id) !== String(id));
        console.log(`Entries before deletion: ${initialLength}, after deletion: ${menu.length}`);

        fs.writeFile('data/configs/offers.json', JSON.stringify(menu, null, 2), (err) => {
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

app.post('/api/deleteimage', (req, res) => {
    const imageName = req.body.name;
    const imagePath = path.join(__dirname, 'media', imageName);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return res.status(500).send('Error deleting image'); // Ensure response is sent only once
        }
        res.send('Image deleted successfully');
    });
});

app.get('/panel/menuentries', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(path.join(__dirname, 'data/dashboard', 'menuentries.html'));
    } else {
        res.redirect('/ui/login');
    }
});

app.get('/api/menuentries', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        // If valid, read the menuentries.json file
        fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading menuentries.json:', err);
                return res.status(500).send('Error reading menu entries');
            }
            // Send the parsed JSON data as a response
            res.json(JSON.parse(data));
        });
    } else {
        // If not valid, redirect to login page
        res.redirect('/ui/login');
    }
});

app.post('/api/editmenuentry', (req, res) => {
    const { id, name, category, price } = req.body;

    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }

        let menuEntries = JSON.parse(data);
        const entryIndex = menuEntries.findIndex(entry => entry.id === id);

        if (entryIndex !== -1) {
            menuEntries[entryIndex] = { ...menuEntries[entryIndex], name, category, price };
            fs.writeFile('data/configs/menuentries.json', JSON.stringify(menuEntries, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to menuentries.json:', err);
                    return res.status(500).send('Error updating menu entry');
                }
                res.send("success");
            });
        } else {
            res.status(404).send('Entry not found');
        }
    });
});

app.post('/api/newmenuentry', (req, res) => {
    const { name, category, price } = req.body;
    const id = makeresultid(6); // Generate a new ID

    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }

        let menuEntries = JSON.parse(data);
        menuEntries.push({ id, name, category, price });

        fs.writeFile('data/configs/menuentries.json', JSON.stringify(menuEntries, null, 2), (err) => {
            if (err) {
                console.error('Error writing to menuentries.json:', err);
                return res.status(500).send('Error saving new menu entry');
            }
            res.send("success");
        });
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

app.post('/api/deletemenuentry', (req, res) => {
    const id = req.body.id;
    console.log('Request body:', req.body);
    console.log(`Received request to delete entry with id: ${id}`);

    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }

        let menuEntries = JSON.parse(data);
        const initialLength = menuEntries.length;
        menuEntries = menuEntries.filter(entry => entry.id !== id);

        console.log(`Entries before deletion: ${initialLength}, after deletion: ${menuEntries.length}`);

        if (menuEntries.length === initialLength) {
            return res.status(404).send('Entry not found');
        }

        fs.writeFile('data/configs/menuentries.json', JSON.stringify(menuEntries, null, 2), (err) => {
            if (err) {
                console.error('Error writing to menuentries.json:', err);
                return res.status(500).send('Error deleting menu entry');
            }
            res.send("success");
        });
    });
});

app.get('/panel/menuentries/new', (req, res) => {
    var token = req.cookies.token;
    console.log(token);
    if (checktoken(token)) {
        res.sendFile(path.join(__dirname, 'data/dashboard', 'newmenuentry.html'));
    } else {
        res.redirect('/ui/login');
    }
});

app.get('/api/cafeteriaMenuEntries', (req, res) => {
    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }

        const menuEntries = JSON.parse(data);
        const cafeteriaEntries = menuEntries.filter(entry => entry.category === "Cafeteria Menü");
        res.json(cafeteriaEntries);
    });
});

app.get('/api/dessertEntries', (req, res) => {
    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }
        const menuEntries = JSON.parse(data);
        const dessertEntries = menuEntries.filter(entry => entry.category === "Dessert");
        res.json(dessertEntries);
    });
});

app.post('/api/saveMenuSelections', (req, res) => {
    const selectedOptions = req.body;
    console.log('Received menu selections:', selectedOptions);

    fs.writeFile('data/configs/menuSelections.json', JSON.stringify(selectedOptions, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing menu selections file:', err);
            return res.status(500).send('Error saving menu selections');
        }
        res.send('Ausgewählte Speiseplaneinträge erfolgreich gespeichert. Nachdem Sie auf OK klicken, lädt sich die Seite neu');
    });
});

app.get('/api/getMenuSelections', (req, res) => {
    fs.readFile('data/configs/menuSelections.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menu selections file:', err);
            return res.status(500).send('Error loading menu selections');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to get salat entries
app.get('/api/salatEntries', (req, res) => {
    fs.readFile('data/configs/menuentries.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menuentries.json:', err);
            return res.status(500).send('Error reading menu entries');
        }
        const menuEntries = JSON.parse(data);
        const salatEntries = menuEntries.filter(entry => entry.category === "Salat");
        res.json(salatEntries);
    });
});

app.get('/api/offers', (req, res) => {
    fs.readFile('data/configs/offers.json', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send('Error reading offers');
        }
        res.json(JSON.parse(data));
    });
});

// Add or update these endpoints

// Get offers
app.get('/api/offers', (req, res) => {
    fs.readFile('data/configs/offers.json', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send('Error reading offers');
        }
        res.json(JSON.parse(data));
    });
});

// Edit offer
app.post('/api/editentry', (req, res) => {
    const updatedOffer = req.body;
    
    fs.readFile('data/configs/offers.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send('Error reading offers');
        }

        let offers = JSON.parse(data);
        const index = offers.findIndex(offer => offer.id === updatedOffer.id);
        
        if (index !== -1) {
            offers[index] = updatedOffer;
            
            fs.writeFile('data/configs/offers.json', JSON.stringify(offers, null, 2), (err) => {
                if (err) {
                    console.error('Error writing offers.json:', err);
                    return res.status(500).send('Error updating offer');
                }
                res.send('success');
            });
        } else {
            res.status(404).send('Offer not found');
        }
    });
});

// Delete offer
app.post('/api/deleteoffer', (req, res) => {
    const { id } = req.body;
    
    fs.readFile('data/configs/offers.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading offers.json:', err);
            return res.status(500).send('Error reading offers');
        }

        let offers = JSON.parse(data);
        const filteredOffers = offers.filter(offer => offer.id !== id);
        
        if (filteredOffers.length === offers.length) {
            return res.status(404).send('Offer not found');
        }

        fs.writeFile('data/configs/offers.json', JSON.stringify(filteredOffers, null, 2), (err) => {
            if (err) {
                console.error('Error writing offers.json:', err);
                return res.status(500).send('Error deleting offer');
            }
            res.send('success');
        });
    });
});

// Add this new endpoint for the admin panel
app.get('/api/getadminoffers', (req, res) => {
    fs.readFile('data/configs/offers.json', (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        // Just send the parsed JSON data directly
        res.json(JSON.parse(data));
    });
});

// Update the dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Read all necessary files
        const [offersData, menuEntriesData, advertisementsData] = await Promise.all([
            fs.promises.readFile('data/configs/offers.json', 'utf8'),
            fs.promises.readFile('data/configs/menuentries.json', 'utf8'),
            fs.promises.readFile('data/configs/advertisements.json', 'utf8')
        ]);

        // Parse JSON data
        const offers = JSON.parse(offersData);
        const menuEntries = JSON.parse(menuEntriesData);
        const advertisements = JSON.parse(advertisementsData);

        // Calculate statistics
        const stats = {
            activeOffers: offers.filter(offer => offer.visibility).length,
            menuEntries: menuEntries.length,
            activeAds: advertisements.filter(ad => ad.enabled).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // If advertisements.json doesn't exist yet, return 0 active ads
        if (error.code === 'ENOENT') {
            const stats = {
                activeOffers: 0,
                menuEntries: 0,
                activeAds: 0
            };
            return res.json(stats);
        }
        res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
});

// Endpoint to serve advertisement content
app.get('/api/advertisement', (req, res) => {
    fs.readFile('data/configs/advertisement.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading advertisement file:', err);
            return res.status(500).send('Error reading advertisement');
        }
        res.json(JSON.parse(data));
    });
});

// Update the advertisement endpoint to handle both new and edit requests
app.post('/api/advertisement', (req, res) => {
    const { id, header, image, description, enabled } = req.body;
    
    fs.readFile('data/configs/advertisements.json', 'utf8', (err, data) => {
        let advertisements = [];
        if (!err) {
            advertisements = JSON.parse(data);
        }

        if (id) {
            // Edit existing advertisement
            const index = advertisements.findIndex(ad => ad.id === id);
            if (index !== -1) {
                advertisements[index] = { id, header, image, description, enabled };
            }
        } else {
            // Create new advertisement
            const newAd = {
                id: Date.now().toString(), // Generate new ID
                header,
                image,
                description,
                enabled: enabled || false
            };
            advertisements.push(newAd);
        }

        fs.writeFile('data/configs/advertisements.json', JSON.stringify(advertisements, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error saving advertisement:', err);
                return res.status(500).send('Error saving advertisement');
            }
            res.send('Advertisement saved successfully');
        });
    });
});

app.get('/panel/advertising', (req, res) => {
    var token = req.cookies.token;
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/advertising.html');
    } else {
        res.redirect('/ui/login');
    }
});

// Also add an endpoint to get list of media files for the dropdown
app.get('/api/media', (req, res) => {
    const mediaDir = path.join(__dirname, 'media');
    fs.readdir(mediaDir, (err, files) => {
        if (err) {
            console.error('Error reading media directory:', err);
            return res.status(500).send('Error reading media files');
        }
        // Filter for image files if needed
        const imageFiles = files.filter(file => 
            file.endsWith('.jpg') || 
            file.endsWith('.jpeg') || 
            file.endsWith('.png') || 
            file.endsWith('.gif')
        );
        res.json(imageFiles);
    });
});

// Get all advertisements
app.get('/api/advertisements', (req, res) => {
    fs.readFile('data/configs/advertisements.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).send('Error reading advertisements');
        }
        res.json(JSON.parse(data));
    });
});

// Delete advertisement
app.post('/api/advertisement/delete', (req, res) => {
    var token = req.cookies.token;
    if (!checktoken(token)) {
        return res.redirect('/ui/login');
    }

    const { id } = req.body;
    
    fs.readFile('data/configs/advertisements.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading advertisements file:', err);
            return res.status(500).send('Error reading advertisements');
        }

        let ads = JSON.parse(data);
        ads = ads.filter(ad => ad.id !== id);

        fs.writeFile('data/configs/advertisements.json', JSON.stringify(ads, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing advertisements file:', err);
                return res.status(500).send('Error deleting advertisement');
            }
            res.send('Advertisement deleted successfully');
        });
    });
});

// Add route for new advertisement page
app.get('/panel/advertising/new', (req, res) => {
    var token = req.cookies.token;
    if (checktoken(token)) {
        res.sendFile(__dirname + '/data/dashboard/newadvertisement.html');
    } else {
        res.redirect('/ui/login');
    }
});
