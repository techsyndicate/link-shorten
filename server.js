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

app.get('/:id', async (req, res) => {
    const link = req.params.id
    const wo = await Link.findOne({backlink:link});
    console.log(wo)
    res.redirect(wo.link);
});

app.get('/asd', (req, res) => {
    res.send('aaaaaaaa')
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});