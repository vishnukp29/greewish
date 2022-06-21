const mongoose=require('mongoose')
const addresschema=new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    userAddress:[
        {UsersName:{
            type:String,
            required:true
        },
        HouseName:{
            type:String,
            required:true
        },
        Place:{
            type:String,
            required:true
        },
        State:{
            type:String,
            required:true
        },
        Pincode:{
            type:Number,
            required:true
        },
        Contact:{
            type:Number,
            required:true
        }}
    ]
    
})


module.exports= mongoose.model("Address",addresschema)
