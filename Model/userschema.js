const mongoose=require('mongoose')
const userschema=new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    }
})


module.exports= mongoose.model("User",userschema)
