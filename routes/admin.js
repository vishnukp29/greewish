let express = require('express');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
let router = express.Router();
const userHelpers = require('../helpers/user-helpers');
const Product=require('../Model/productschema')
const Cart=require('../Model/cartschema')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/',verifyLogin,function(req, res, next) {
  res.render('admin/admin-home',{admin:true}) 
});

router.get('/view_products',verifyLogin,function(req,res){
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view_products',{admin:true,products})
  })
 
})

// Add Products

router.get('/add-products',verifyLogin,async(req,res)=>{
  admin=req.session.admin
  const subCat=await productHelpers.getSubCategory()
  console.log(subCat+'Greewish')
  const catg=await productHelpers.getCategory()
  console.log(catg+'Greewish')
  res.render('admin/add-products',{subCat,catg,admin:true})
})

router.post('/add-products',productHelpers.upload.fields([{name:"Image",maxCount:1},{name:"Images",maxCount:1}]),(req,res)=>{
  console.log(req.files, "files");
  console.log(req.body, "body");
  let mainImage=req.files.Image[0].filename
  let nextImage=req.files.Images[0].filename

  console.log(req.body);
  productHelpers.addProduct(req.body,mainImage,nextImage).then((id)=>{
    res.redirect('/admin')
  })
})

router.get('/all-user',verifyLogin,function(req,res){
  userHelpers.getAllUsers().then((users)=>{
    res.render('admin/all-user',{admin:true,users})
  })
  
})

router.get('/all-orders',verifyLogin,function(req,res){
  productHelpers.getAllOrders().then((allorders)=>{
    res.render('admin/all-orders',{admin:true,allorders})
  })
  
})

router.get('/dashboard',verifyLogin,async(req,res)=>{
  let allorders=await productHelpers.getAllOrders()
  let ordercount=await productHelpers.getOrderCount()
  let productcount=await productHelpers.getProductCount()
  let usercount=await productHelpers.getUserCount()
  let totalincome=await productHelpers.getTotalIncome()
  res.render('admin/dashboard',{admin:true,allorders,ordercount,productcount,usercount,totalincome})
  // res.render('admin/dashboard',{admin:true})
})

router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view_products')
  })
})

router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  const subcatdetails=await productHelpers.getSubCategory()
  const catdetails=await productHelpers.getCategory()
  res.render('admin/edit-product',{admin:true,product,subcatdetails,catdetails})
})

router.post('/edit-product/:id',productHelpers.upload.fields([{name:"Image",maxCount:1},{name:"Images",maxCount:1}]),async(req,res)=>{
  const id=req.params.id 
  let productDetails=await Product.findById(id).lean()
 let mainImage=req.files.Image?req.files.Image[0].filename:productDetails.allImages[0].mainImage
 let nextImage=req.files.Images?req.files.Images[0].filename:productDetails.allImages[0].nextImage

  productHelpers.updateProduct(req.params.id,req.body,mainImage,nextImage).then(()=>{
    res.redirect('/admin/view_products')
   
  })

})


router.get('/add_category',verifyLogin,function(req,res){
  res.render('admin/add_category',{admin:true})
})

router.post('/add_category',productHelpers.addCategory)

router.get('/add_subcategory',verifyLogin,async(req,res)=>{
  const result=await productHelpers.getCategory()
  console.log(result)
  res.render('admin/add_subcategory',{admin:true,result})
})

router.post('/add_subcategory',(req,res)=>{
  productHelpers.addSubCategory(req.body).then((data)=>{
    console.log(data)
    res.redirect('/admin/add_subcategory')
  })
})

router.get('/banner',verifyLogin,async(req,res)=>{
  let ban_img=await productHelpers.getImages()
  res.render('admin/banner',{admin:true,ban_img})
})

router.post('/banner',productHelpers.upload.single('Image'),(req,res)=>{
  productHelpers.addBannerImage(req.file.filename).then((id)=>{
    res.redirect('/admin')
  })
})

router.get('/shipped/:id', (req, res) => {
  //admin=req.session.admin
   productHelpers.changeOrderStatusShipped(req.params.id).then(() => {
     res.redirect('/admin/all-orders')
   })
 })
 router.get('/delivered/:id', (req, res) => {
   //admin=req.session.admin
  
   productHelpers.changeOrderStatusdelivered(req.params.id).then(() => {
     res.redirect('/admin/all-orders')
   })
 })

router.get('/invoice',(req,res)=>{
  res.redirect('/admin/invoice')
})

module.exports = router;
