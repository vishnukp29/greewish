const mongoose=require('mongoose')
const categoryschema=new mongoose.Schema({
    Categoryname:{
        type:String,
        required:true
    }
})
module.exports=mongoose.model("Category",categoryschema)
