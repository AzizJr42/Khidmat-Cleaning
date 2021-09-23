const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const nodemon = require('nodemon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const {check , validationResult} = require('express-validator');
const appoints = require('./models/appoint');
const contacts = require('./models/contact');
const User = require('./models/User');


const passport = require('passport');

//passport config
require('./config/passport')(passport);
const {logged} = require('./config/auth')





app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost/Appointment',{useNewUrlParser:true,useUnifiedTopology:true})
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
  console.log('mongodb connected')
})
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(require('connect-flash')());
app.use(function(req,res,next){
res.locals.messages = require('express-messages')(req,res);
next();
});


app.get('/', (req, res) => {
    res.render('index')
  })
  app.get('/About', (req, res) => {
    res.render('about')
  })
  app.get('/Services', (req, res) => {
    res.render('services')
  })
  app.get('/booking', (req, res) => {
    res.render('book')
  })
  app.get('/Contact', (req, res) => {
    res.render('contact')
  })


  app.get('/create',(req, res) => {
    // console.log("create :");
   //  console.log(req.body);
    res.render('user_register');
 });


 app.post('/create', [
  check('name', 'Name is Required').exists().isLength({
      min: 3
  }),
  check('email', 'Email is Required').exists().isEmail({
      min: 3
  }),
  check('email').custom(value =>{
      return User.findOne({email:value}).then(user=>{
          if(user)
          {
           return Promise.reject('E-mail already in use');
          }
      })
  }),
  //checking password exists
  check('password','Password is Required Password Must be atleast 6 character').exists().isLength({
      min: 6
  }),
  //matching passwords
  check('password2').custom((value,{req})=>{
      if (value !== req.body.password) {
          return Promise.reject('Password confirmation does not match password');
          }
          else{

              return true;
          }
  })   

], (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render('user_register', {
          alert
      });
  } else {
          const newuser = new User ({
              name:req.body.name,
              email:req.body.email,
              password:req.body.password,
              role:req.body.role
          })
          bcrypt.genSalt(saltRounds, function(err, salt) {
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                  if(err){throw err}

                  newuser.password = hash;
                  newuser.save()
                  .then(user =>{
                      req.flash('success','New User added.');
                      res.redirect('/');
                  })
                  .catch(err =>console.log(err))
              });
          });     
  }
});
app.get('/dashboard',logged, (req, res,next) => {
  if(req.user.role == 1){
    
    req.flash('danger','You Are Not Accesible To this page')
    res.redirect('/')
  }
  res.render('dashboard')
})

app.get('/users',logged,(req, res,next) => {
  //console.log(req.user.role);
    if(req.user.role == 1){
      
      req.flash('danger','You Cannot Access This Page')
      res.redirect('/')
    }
  
  

   User.find()
   .then((results)=>{
     res.render('users',{users:results});
   // res.send(results)
   })
   .catch(err=>{console.log(err)});

});
app.get('/users/delete/:id', (req, res) => {
  User.deleteOne({_id:req.params.id})
  .then(results =>{
    req.flash('danger','Record Deleted Succesfully');
    res.redirect('/users');
})
  .catch(err=>{console.log(err)});
})
  

  app.post('/',[
    check('name','Name is required.').exists().isLength({min:3}),
    check('phone','Phone is required.').exists().isLength({min:11}),
    check('email','Email is required.').exists().isLength({min:5}),
    check('address','Address is required.').exists().isLength({min:7}),
    check('services','Service is required.').exists().isLength({min:3})

  ], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
  {
    //console.log(req.file.mimetype);
    const alert = errors.array();
  // return res.status(400).json({ errors: errors.array() });
   res.render('index',{alert});
  }else{
    const appoint = new appoints({name:req.body.name,phone:req.body.phone,email:req.body.email,address:req.body.address,services:req.body.services})
    appoint.save()
    .then(results =>{
      req.flash('success','Your Request Has Been Submitted Succesfully');
      res.redirect('/');})
    .catch(err=>{console.log(err)});
    
  }});
  app.post('/booking',(req, res) => {
    const appoint = new appoints({name:req.body.name,phone:req.body.phone,email:req.body.email,address:req.body.address,services:req.body.services})
    appoint.save()
    .then(results =>{
      req.flash('success','Your Request Has Been Submitted Succesfully');
      res.redirect('/booking');})
    .catch(err=>{console.log(err)});
    
  });
  app.get('/Admin',logged, (req, res) => {
    //console.log(req.user.role);
    if(req.user.role == 1){
      
      req.flash('danger','You Cannot Access This Page')
      res.redirect('/')
    }
    
    appoints.find()
    .then(results =>{res.render('admin',{appoints:results});
  })
    .catch(err=>{console.log(err)});
  })
  app.get('/appoints/delete/:id', (req, res) => {
    appoints.deleteOne({_id:req.params.id})
    .then(results =>{
      req.flash('danger','Record Deleted Succesfully');
      res.redirect('/Admin');
  })
    .catch(err=>{console.log(err)});
  })
  app.post('/Contact', (req, res) => {
  
    const contact = new contacts({name:req.body.name,email:req.body.email,subject:req.body.subject,message:req.body.message})
    contact.save()
    .then(results =>{
      req.flash('success','Your message was sent, thank you!');
      res.redirect('contact');})
    .catch(err=>{console.log(err)});
    
  });

  app.get('/Admin-contact',logged, (req, res) => {
    //console.log(req.user.role);
    if(req.user.role == 1){
      
      req.flash('danger','You Cannot Access This Page')
      res.redirect('/')
    }
    contacts.find()
    .then(results =>{res.render('admin-contact',{contacts:results});
  })
    .catch(err=>{console.log(err)});
  })
  app.get('/contacts/delete/:id', (req, res) => {
    contacts.deleteOne({_id:req.params.id})
    .then(results =>{
      req.flash('danger','Record Deleted Succesfully');
      res.redirect('/Admin-contact');
  })
    .catch(err=>{console.log(err)});
  })

  app.get('/users/delete/:id', (req, res) => {
    User.deleteOne({_id:req.params.id})
    .then(results =>{
      req.flash('danger','Record Deleted Succesfully');
      res.redirect('/users');
  })
    .catch(err=>{console.log(err)});
  })



  app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res, next) => {
    
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })(req, res,next)
});

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success','you are logged out');
    res.redirect('/login');
});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })