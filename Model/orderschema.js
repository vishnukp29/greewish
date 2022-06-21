const mongoose=require ('mongoose');
const orderSchema=new mongoose.Schema({
   
  
    userAddress:
    {
    
        UsersName:{
            type:String,
            required:true,
        },
        HouseName:{
            type:String,
            required:true,
        },
        Place:{
             type:String,
             required:true,
        },
        State:{
             type:String,
             required:true,
        },
        Pincode:{
            type:String,
            required:true,
        },
        Contact:{
            type:String,
            required:true,
        },
           
    },

    products:[{type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
    }],
    userId:{type:mongoose.Schema.Types.ObjectId,
      ref:"User",
     
    }, 
    totalAmt:{
        type:Number,
    },
    PaymentMethod:{
        type:String,
    },
    status:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now
    },

    },
    {timestamps:true}
)

module.exports=mongoose.model("Order",orderSchema)