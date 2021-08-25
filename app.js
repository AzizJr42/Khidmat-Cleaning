const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const nodemon = require('nodemon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');


app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');


app.get('/', (req, res) => {
    res.render('index')
  })




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })