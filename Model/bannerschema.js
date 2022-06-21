const mongoose=require('mongoose')
const bannerschema=new mongoose.Schema({ 
    bannerImages:
    {
        type:String
        
    }
})


module.exports=mongoose.model("Banner",bannerschema)
