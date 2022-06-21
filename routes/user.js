let express = require('express');
const session = require('express-session');
const { response } = require('../app');
const Config=require('../Config/configmongo')
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
let router = express.Router();
const signup=require('../helpers/user-helpers')
const login=require('../helpers/user-helpers')
const mongoose=require('mongoose')

/*Verify Login Function*/
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  let carousel=await productHelpers.getImages()
  productHelpers.getAllProducts().then((products)=>{
    productHelpers.getCategory().then((catg)=>{
      productHelpers.getCategoryDropdown().then((categories)=>{
        res.render('index', {products,user,cartCount,catg,categories,carousel});
      })
    })
    
    console.log(user);
  })
  
});

router.get('/product-categories/:id',async(req,res)=>{
  let user=req.session.user
  let productCategories=await productHelpers.getCategoryProducts(req.params.id)
  res.render('user/product-categories',{user,productCategories})
})

/*SignUp Page*/
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',signup.doUserSignup)

/*Login Page*/
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }
  else if(req.session.admin){
    res.render('admin',{admin:true,admin})
  }
  else{
    res.render('user/login',{'loginErr':req.session.loginErr})
    req.session.loginErr=false
  }
})
 
router.post('/login',(req,res)=>{
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  login.doUserLogin(req.body).then((response)=>{
    if(response.user){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else if(response.admin){
      req.session.loggedIn=true
      req.session.admin=response.admin
      res.redirect('/admin')
    }else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})

/*Logout Page*/
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')   
})

/*Cart Page*/
router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let products= await userHelpers.getCartPoducts(req.session.user._id)
  let total= await userHelpers.getTotalPrice(user._id)
  console.log(products+'Items');
  console.log(total+'Total');
  res.render('user/cart',{products,user,total}) 
})

/*Add to Cart Page*/
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log('API Call');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    // res.redirect('/')
    res.json({status:true})
  })
})

/*Verifying Otp*/
router.get('/verify-otp',(req,res)=>{
  if(req.session.user){
    res.redirect('/login')
  }else{
    res.render('user/verify-otp')
  }
  
})

router.post('/verify-otp',userHelpers.VerifyOTP)


router.get('/forgot-pswd-mail',userHelpers.forgetPassword)


router.get('/forgot-pswd-otp',userHelpers.verifyPasswordOtp)

router.get('/reset-pswd',userHelpers.resetPassword)

router.post('/forgot-pswd-mail',userHelpers.resetPassOtpSendToEmail)

router.post('/forgot-pswd-otp',userHelpers.forgetPasswordOtp)

router.post('/reset-pswd',userHelpers.updateNewPassword)


/* User Profile */
router.get('/profile',(req,res)=>{
  let user=req.session.user
  if(req.session.user){
    res.render('user/profile',{user})
  }
  else{
    res.render('index',)
  }
  
})

router.post('/profile/:id',(req,res)=>{
  userHelpers.updateUserDetails(req.params.id,req.body).then((response)=>{
    console.log(response)
    res.redirect('/')
  })

})

/* View Product Details */

router.get('/view-product-details/:id',async(req,res)=>{
  let user=req.session.user
  if(req.session.user){
    let product_details=await productHelpers.getProductDetails(req.params.id)
    res.render('user/view-product-details',{product_details,user})
  }
  else{
    let product_details=await productHelpers.getProductDetails(req.params.id)
    res.render('user/view-product-details',{product_details})
  }
  
})

/* Delete Cart Items*/
router.get('/delete-cart_item/:id',(req,res)=>{
  let prodId=req.params.id
  let user=req.session.user._id
  console.log(prodId)
  productHelpers.deleteCartItem(prodId,user).then((response)=>{
    res.redirect('/cart')
  })
})


/*Add Address*/
router.get('/add-address',verifyLogin,async(req,res)=>{
  let user=req.session.user
  
  let total=await userHelpers.getTotalPrice(user._id)
  let address=await userHelpers.getAllAddress(user._id)
  
    res.render('user/add-address',{user,total,address})
 
})

router.post('/add-address',async(req,res)=>{
  let user=req.session.user
   userHelpers.saveAddress(req.body).then((response)=>{

    res.json({status:true})
   })
    
  console.log(req.body);
})



/* Product Quantity increase/ decrease */
router.post('/change-product-quantity',(req,res)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body,req.session.user).then((response)=>{
    res.json(response)
  })
})

//---------------place-order----------------
router.get('/place-order/:id',verifyLogin,async(req,res)=>{
  let user=req.session.user;
  let total=await userHelpers.getTotalPrice(req.session.user._id) 
  let address=await userHelpers.sendUserAddress(req.params.id)
  
    res.render('user/place-order',{user,address,total}) 
  })
  
  router.post('/place-order',async(req,res)=>{
    let products=await userHelpers.getCartProductList(req.body.userId)
    let total=await userHelpers.getTotalPrice(req.body.userId)

    console.log('Total....:',total);
    console.log('Products.....',products)
    userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
      if(req.body['PaymentMethod']==='COD'){
        res.json({codSuccess:true})
      }

      else{
        userHelpers.generateRazorpay(orderId,total).then((response)=>{
          console.log(response+'helloooooooo')
          res.json(response)
        })
      }
    })
    console.log(req.body,"---bodyyy");
  })
  
  // router.get('/order-success',async(req,res)=>{
  //   let user=req.session.user
  //   res.render('user/order-success',{user:req.session.user,total})    
  // })

  router.get('/orders',verifyLogin,async(req,res)=>{
    let user=req.session.user
    // let orders=await userHelpers.getCartProductList(req.session.user._id)
    let orderProduct=await userHelpers.getUserOrder(req.params._id)
    console.log('Hellooooo'+orderProduct);
    res.render('user/orders',{user,orderProduct})
  })
  
  router.get('/view-order-products/:id',async(req,res)=>{
    let products=await userHelpers.getOrderProducts(req.params.id)
    res.render('user/view-order-products',{user:req.session.user,products})
  })

  router.post('/verify-payment',(req,res)=>{
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        res.json({status:true})
      })
    }).catch((err)=>{
      res.json({status:false,errMsg:''})
    })
  })

  /* Search */
  router.post('/search',async(req,res)=>{
    let searchByText=req.body['Search'];
    console.log(searchByText+'search=============');
    try {
      let user=req.session.user
      let getProductSearch=await productHelpers.getAllProducts()
      let categories=await productHelpers.getCategoryDropdown()
      let subcategories=await productHelpers.getSubCategory()
      if(searchByText){
        let products=getProductSearch.filter((p)=>p.prdName.includes(searchByText))
        res.render('index',{products,user,categories,subcategories})
      }
    } catch (error) {
       console.log(error);
    }
  })

  router.get('/order-success',verifyLogin,(req,res)=>{
    let user=req.session.user
    res.render('user/order-success',{user})
  })



module.exports = router;
