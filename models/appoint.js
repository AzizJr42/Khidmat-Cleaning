const mongoose = require('mongoose')

const appointschema = new mongoose.Schema({
    name: {type:String,required:true},
    phone: {type:String,required:true},
    email: {type:String,required:true},
    address: {type:String,required:true},
    services: {type:String,required:true},
    
},{timestamps:true})

const appoint = mongoose.model('appoint',appointschema);
module.exports = appoint;