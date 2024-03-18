const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
// for cross origin resource sharing
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"..", 'build')));
app.use(express.static(path.join(__dirname,"..", 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = { app };