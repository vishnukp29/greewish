//const { resolve } = require('express-hbs/lib/resolver')
const db=require('../Config/configmongo')
const Product=require('../Model/productschema')
const Cart=require('../Model/cartschema')
const Category=require('../Model/categoryschema')
const subCategory=require('../Model/subcategoryschema')
const Banner=require('../Model/bannerschema')
const Order=require('../Model/orderschema')
const User=require('../Model/userschema')
const objectId=require('mongoose').objectId
const multer=require('multer')

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        
        cb(null,'./public/ProductImages')
    },
    
    filename:function(req,file,cb){

       cb(null,Date.now()+'--'+file.originalname)
    }
  });
  const upload= multer({storage:storage})

/*Add Product*/

const addProduct=(adminProduct,mainImage,nextImage)=>{
    return new Promise(async(resolve,reject)=>{
        const subcategories= await subCategory.findOne({Subcategoryname:adminProduct.Subcategoryname})
        const categories= await Category.findOne({Categoryname:adminProduct.Categoryname})
        let main_i=mainImage
        let next_i=nextImage
        const product=await new Product({
           
            prdName:adminProduct.prdName,
            Subcategoryname:subcategories._id,
            Categoryname:categories._id,
            Description:adminProduct.Description,
            Price:adminProduct.Price,
            Earliest_Delivery:adminProduct.Earliest_Delivery,
            allImages:[main_i,next_i]
            
            
        })
        await product.save().then((data)=>{
            console.log(data);
            resolve(data)
        })
    })
}

const addBannerImage=(bannerImage)=>{
    return new Promise(async(resolve,reject)=>{
        let banner_i=bannerImage
        const banImg=await new Banner({
            bannerImages:banner_i      
        })
        await banImg.save().then((data)=>{
            console.log(data);
            resolve(data)
        })
    })
}

const getImages=()=>{
    return new Promise(async(resolve,reject)=>{
        await Banner.find().lean().then((image_det)=>{
            console.log('Images',image_det);
            resolve(image_det)
        })
    })
}


/*Get Product Details*/
const getProductDetails = (proId) => {
    return new Promise((resolve, reject) => {
        const getproductdetails=Product.findOne({_id:proId}).lean().populate('Subcategoryname')
            console.log(getproductdetails+'gffffffffffff')
            resolve(getproductdetails)
        })
}

/* Update Product*/
const updateProduct=(proId,details,mainImage,nextImage)=>{
    return new Promise(async(resolve,reject)=>{
        let main_i=mainImage       
        let next_i=nextImage
        const subcategories= await subCategory.findOne({Subcategoryname:details.Subcategoryname})
        const categories= await Category.findOne({Categoryname:details.Categoryname})
        Product.updateOne({_id:proId},{
        $set:{
            prdName:details.prdName,
            Subcategoryname:subcategories._id,
            Categoryname:categories._id,
            Description:details.Description,
            Price:details.Price,
            Earliest_Delivery:details.Earliest_Delivery,
            allImages:[main_i,next_i]
        }
      }).then((response)=>{
        resolve()
      })
    })
}

/*Add Category*/
const addCategory = async (req, res) => {
    try {

        const category_data = await Category.find()
        if (category_data.length > 0) {
            let checking = false;
            for (let i = 0; i <category_data.length; i++) {
                if (category_data[i]['Categoryname'].toLowerCase() === req.body.Categoryname.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const category = new Category({
                    Categoryname: req.body.Categoryname
                })
                console.log(category)
                const category_data = await category.save()
                console.log(category_data)
                res.redirect('/admin/add_category')
            }
            else{
                res.status(200).send({success:true,message:"This Category ("+req.body.Category+") is already exists" })
            }
        }
        else{
            const category = new Category({
                Categoryname: req.body.Categoryname
            })
            const category_data = await category.save()
            console.log(category_data)
            res.redirect('/admin/add_category')
        }
    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message })

    }
}

/*Get Category*/
const getCategory=()=>{
    return new Promise((resolve,reject)=>{
        Category.find().lean().populate('Categoryname').then((category_data)=>{
            resolve(category_data)
            console.log(category_data)
        })
    })
}

/*Add Sub-Category*/
const addSubCategory=(data)=>{
    try{
         return new Promise (async(resolve,reject)=>{
             const newcategory= await Category.findOne({Categoryname:data.Categoryname})
             console.log(newcategory)
             const newsubcategory = new subCategory({
                Subcategoryname: data.Subcategoryname,
                Categoryname:newcategory._id
            })
            await newsubcategory.save().then((data)=>{
                console.log(data)
                resolve(data)
            })
         })
    }
    catch(error){
        console.log(error.message)
    }
}

/*Get Sub-Category*/
const getSubCategory=()=>{
        return new Promise(async(resolve,reject)=>{
        const displaySubCatagory= await subCategory.find().lean().populate('Subcategoryname')
            resolve(displaySubCatagory)
            console.log(displaySubCatagory)
        })
}

const changeOrderStatusShipped=(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'Shipped'}
        })
         resolve(order)
       
       
    })
}

const changeOrderStatusdelivered=(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'Delivered'}
        })
         resolve(order) 
       
       
    })
}


    
/*Exporting Functions*/
module.exports={addProduct, 
    upload,
    getProductDetails,
    updateProduct,
    addCategory,
    getCategory,
    addSubCategory,
    getSubCategory,
    addBannerImage,
    changeOrderStatusShipped,
    changeOrderStatusdelivered,
    getImages,

    getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await Product.find().lean().populate('Subcategoryname')
        resolve(products)
        let prdcount=await Product.count()
        resolve(prdcount)
        console.log('Product Count: '+prdcount);
        
    })
},
deleteProduct:(proId)=>{
    return new Promise((resolve,reject)=>{
        Product.deleteOne({_id:proId}).then(()=>{
            resolve()
        })
    })
},

deleteCartItem:(prodId,userId)=>{
    return new Promise((resolve,reject)=>{
        Cart.updateOne(
            {user_Id:userId},
            {
                $pull:{
                    cartItems:{
                        pro_Id:prodId
                    }
                }
            }
        ).then((response)=>{
            console.log(response);
            resolve(response)
        })
    })
},

getCategoryDropdown:(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
        const displayCatagoryDropdown=await Category.find().lean().populate('Categoryname')
        resolve(displayCatagoryDropdown)
    })
},

getCategoryProducts:(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({Categoryname:categoryId}).lean().populate('Subcategoryname').populate('Categoryname').then((prod_det)=>{
            resolve(prod_det)
            console.log('helloooooo'+ prod_det);
        })
        
    })
},

getSubCategoryProducts:(subcategoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({Subcategoryname:subcategoryId}).lean().populate('Subcategoryname').populate('Categoryname').then((prod_detl)=>{
            resolve(prod_detl)
            console.log('helloooooo'+ prod_detl);
        })
        
    })
},


getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
        let allorders = await Order.find().lean()
        resolve(allorders)
    })
},

getOrderCount: () => {
    return new Promise(async (resolve, reject) => {
        let ordercount=await Order.count()
        resolve(ordercount)
        console.log('Order Count: '+ordercount);
    })
},

getProductCount: () => {
    return new Promise(async (resolve, reject) => {
        let productcount=await Product.count()
        resolve(productcount)
        console.log('Product Count: '+productcount);
    })
},

getUserCount: () => {
    return new Promise(async (resolve, reject) => {
        let usercount=await User.count()
        resolve(usercount)
        console.log('User Count: '+usercount);
    })
},

    getTotalIncome:()=>{
        return new Promise(async (resolve,reject)=>{
            let income=await Order.aggregate([{
                $group:{
                    _id:null,
                    total:{
                        $sum:'$totalAmt'
                    }
                }}
            ])
            console.log('Total Income: '+income[0].totalAmt);
            let sum=income[0].total
            resolve(sum)            
        })
    }
} 