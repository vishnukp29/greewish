const mongoose=require('mongoose')
const cartschema=new mongoose.Schema({
    user_Id:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    cartItems:[
        {
            pro_Id:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                default:1
                
            },
            shipping:{
                type:Number,
                default:60
                
            },
            Price:{
                type:String,
            },
            subtotal:{
                type:Number,
                default:0
            }
            
        }
    ],
    total:{
        type:Number,
        default:0
        
    },
    modifiedOn:{
        type:Date,
        default:Date.now
    }
},
{timestamps:true})

module.exports= mongoose.model("Cart",cartschema)
