const mongoose = require('mongoose');

const Usershecma = new mongoose.Schema({
    name: {type:String,required:true},
    email: {type:String,required:true},
    password: {type:String,required:true},
    role: {type:Number,required:true}


  },{timestamps:true});
  //it will look for Students collection in side a which ever db you have selected in DB Connection String
  //Student = Students
  const User = mongoose.model('User', Usershecma);
  module.exports = User;
  