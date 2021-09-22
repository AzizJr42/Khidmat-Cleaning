
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = function(passport){

passport.use(new LocalStrategy({usernameField: 'email'},
  function(username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect Email.' });
      }
      bcrypt.compare(password, user.password).then(function(result) {
        if(result){
            return done(null, user);
            
        }
        else{
            return done(null, false, { message: 'Incorrect password.' });
        }
     });
    });
  }
));


passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  
  passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(err, user) {
      if(err){
        done(null,false ,{error :err});
      }
      else{
      done(err, user);
      }
    });
  });


}