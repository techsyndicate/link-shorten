require('dotenv').config()
const express = require('express');

const session = require('express-session')

const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGO_URI, console.log('MONGODB CONNECTED'))

const Link = require('./schemas/linkSchema');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use(express.urlencoded({extended: false}))

app.get('/*', async (req, res) => {
    let link = req.url 
    
    console.log(link)

    link = req.url.substring(1);
    const wo = await Link.findOne({backlink:link});
    console.log(wo)
    if(!wo) res.redirect('https://techsyndicate.us');
    else{
        res.redirect(wo.link);
    }
});

app.get('/', (req, res) => {
    res.redirect('https://techsyndicate.us')
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});