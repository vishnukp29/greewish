const mongoose=require('mongoose')
const productschema=new mongoose.Schema({
    prdName:{
        type:String,
        required:true
    },
    Categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subCategory',
        required:true
    },
    Subcategoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subCategory',
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Price:{
        type:String,
        required:true
    },
    Earliest_Delivery:{
        type:String,
        required:true
    },
    allImages:
    {
        type:Array,
        required:true
    }
})


module.exports=mongoose.model("Product",productschema)
