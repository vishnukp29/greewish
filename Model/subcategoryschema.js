const mongoose=require('mongoose')
const subcategoryschema=new mongoose.Schema({
    Subcategoryname:{
        type:String,
        required:true
    },
    Categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    }
})
module.exports=mongoose.model("subCategory",subcategoryschema)
