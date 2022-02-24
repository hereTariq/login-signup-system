const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);
const {join} = require('path');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();
app.set('view engine','ejs');
app.use(express.static(join(__dirname,'public')));
app.use(express.urlencoded({extended: false}));


const store = {
    uri: process.env.MONGO_URI,
    collection: 'session',
}

app.use(session({
    secret: 'hugl4ut432#$#$@jhjdsfhdsf',
    resave: false,
    saveUninitialized: false,
    store: store
}))

const PORT = process.env.PORT || 4300;
app.use(authRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(result => {
    console.log('mongodb connected');
    app.listen(PORT, () => console.log(`server runnin on port`,PORT));
}).catch(err => {
    throw err;
});

