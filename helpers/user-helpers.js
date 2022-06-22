const mongoose = require('mongoose')
const db = require('../Config/configmongo')
const User = require('../Model/userschema')
const Admin = require('../Model/adminschema')
const Cart = require('../Model/cartschema')
const Address = require('../Model/addresschema')
const nodemailer = require('nodemailer')
const Product = require('../Model/productschema')
const Order = require('../Model/orderschema')
const Razorpay = require('razorpay')
require('dotenv').config()
let instance = new Razorpay({
    key_id:process.env.RAZORPAY_ID,
    key_secret:process.env.RAZORPAY_KEY,
});

 const bcrypt = require('bcrypt')
// const {
//     resolve
// } = require('express-hbs/lib/resolver')
const {
    collection,
    schema
} = require('../Model/userschema')
const {
    response
} = require('../app')

const securePassword = async (Password) => {
    try {
        const passwordHash = await bcrypt.hash(Password, 10)
        return passwordHash
    } catch (err) {
        console.log(err.message);
    }
}

const doUserSignup = async (req, res) => {
    console.log(req.body)
    try {
        const userPassword = await securePassword((req.body.Password))
        const user = await new User({
            Name: req.body.Name,
            Phone: req.body.Phone,
            Email: req.body.Email,
            Password: userPassword
        })
        console.log(user);
        req.session.userDetials = user
        const otpGenerator = Math.floor(1000 + Math.random() * 9000);
        console.log(otpGenerator);
        req.session.OTP = otpGenerator;
        if (user) {
            sendVerifyMail(req.body.Name, req.body.Email, otpGenerator)
            res.render('user/verify-otp', {
                message: "Registration Completed"
            })
        } else {
            res.render('user/signup', {
                message: "Registration Failed"
            })
        }

    } catch (err) {
        console.log(err);
    }
}

const sendVerifyMail = async (Name, Email, otpGenerator) => {

    try {
        const mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }

        });

        const mailDetails = {
            from: "info.greewish@gmail.com",
            to: Email,
            subject: "for user verification",
            text: "just random texts ",
            html: '<p>hi ' + Name + 'your otp ' + otpGenerator + ''
        }
        mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Email has been sent ", Info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

// verify otp
const VerifyOTP = async (req, res) => {

    let userOTP = req.body.otp
    let validOtp = req.session.OTP
    let userDetials = req.session.userDetials
    console.log(userDetials);
    try {
        if (validOtp == userOTP) {
            const user = new User({
                Name: userDetials.Name,
                Phone: userDetials.Phone,
                Email: userDetials.Email,
                Password: userDetials.Password
            });
            const userData = await user.save();
            req.session.userLoggedIn = true
            req.session.user = userData
            req.session.userDetials = null
            req.session.OTP = null
            res.redirect("/login")
        } else {
            req.session.ErrOtp = "Invalid OTP"
            res.redirect("/verify-mail")
        }


    } catch (error) {
        console.log(error);
    }
}

//forgot password
const forgetPassword = async (req, res) => {

    try {

        res.render("user/forgot-pswd-mail", {
            admin: false,
            mailMsg: req.session.checkMailMsg,
            Errmsg: req.session.checkMailErr
        })
        req.session.checkMailMsg = false
        req.session.checkMailErr = false
    } catch (error) {
        console.log(error);
    }
}

//reset -password otp

const verifyPasswordOtp = async (req, res) => {
    try {
        res.render('user/forgot-pswd-otp', {
            admin: false
        })
    } catch (error) {
        console.log(error);
    }
}

//reset-password

const resetPassword = async (req, res) => {
    try {
        res.render('user/reset-pswd', {
            admin: false
        })
    } catch (error) {
        console.log(error);
    }
}


// reset password otp send to Email                                              
const resetPassOtpSendToEmail = async (req, res) => {

    try {

        const email = req.body.Email;
        const userResetData = await User.findOne({
            Email: email
        });
        req.session.userResetid = userResetData._id;

        if (userResetData) {
            const otpGenerator = Math.floor(1000 + Math.random() * 9000);
            console.log(otpGenerator);
            req.session.OTP = otpGenerator;

            sendPasswordResetMail(userResetData.Name, userResetData.Email, otpGenerator)

            req.session.checkMailMsg = "Check your Email to reset your password"
            res.redirect("/forgot-pswd-otp")

        } else {

            req.session.checkMailErr = "Invalid Email Id"
            res.redirect("/forgot-pswd-mail")
        }


    } catch (error) {
        console.log(error);
    }
}


// send reset password mail start
const sendPasswordResetMail = async (Name, Email, otpGenerator) => {

    try {
        const mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "gmail",
            port: 587,
            secure: true,
            auth: {
                user: "info.greewish@gmail.com",
                pass: "gqaxseqrzuxaqtkd"
            },
            tls: {
                rejectUnauthorized: false
            }

        });

        const mailDetails = {
            from: "info.greewish@gmail.com",
            to: Email,
            subject: "Reset Password",
            text: "hai your otp is please verify " + otpGenerator + '',
            //html: '<p>Hi ' + firstname + ' click <a href ="http://localhost:3000/user/reset-password?tocken=' + tocken + '"> here to </a> to reset your password</p>'
        }
        mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("email has been sent ", Info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}


//------------forget password verify otp---------------
const forgetPasswordOtp = async (req, res) => {
    let userOtp = req.body.fotp
    let userNewOtp = req.session.OTP
    try {
        if (userNewOtp == userOtp) {
            res.redirect('/reset-pswd')
        } else {
            res.redirect('/forgot-pswd-mail')
        }
    } catch (error) {
        console.log(error);
    }
}


// update the user password
const updateNewPassword = async (req, res) => {

    try {
        const newPassword = req.body.Password
        const resetId = req.session.userResetid
        const newSecurePassword = await securePassword(newPassword);
        const updatedUserData = await User.findByIdAndUpdate({
            _id: resetId
        }, {
            $set: {
                Password: newSecurePassword
            }
        })
        req.session.randomString = null;
        req.session.userResetid = null;
        req.session.resetSuccessMsg = "Your password updated successfully.."
        res.redirect("/login")


    } catch (error) {
        console.log(error.message);
    }
}

// Get Cart
const getCartPoducts = (userId) => {
    return new Promise(async (resolve, reject) => {
        let cartItems = await Cart.find({
            user_Id: userId
        }).lean().populate('cartItems.pro_Id')
        resolve(cartItems)
        console.log(cartItems + 'ggggg');
    })
}

/* User Profile view and edit */

const updateUserDetails = (userId, userDetails) => {
    return new Promise(async (resolve, reject) => {
        let updateUser = await User.updateOne({
                _id: userId
            }, {
                Name: userDetails.Name,
                Phone: userDetails.Phone,
                Email: userDetails.Email
            })
            .then((updateUser) => {
                resolve()
            })

    })
}

/* Add Address */

const addAddress = (userAddress) => {
    return new Promise(async (resolve, reject) => {
        const address = await new Address({
            UsersName: userAddress.UsersName,
            HouseName: userAddress.HouseName,
            Place: userAddress.Place,
            State: userAddress.State,
            Pincode: userAddress.Pincode,
            Contact: userAddress.Contact


        })
        await address.save().then((data) => {
            console.log(data);
            resolve(data)
        })
    })
}

module.exports = {
    doUserSignup,
    VerifyOTP,
    forgetPassword,
    verifyPasswordOtp,
    resetPassword,
    resetPassOtpSendToEmail,
    updateNewPassword,
    forgetPasswordOtp,
    getCartPoducts,
    updateUserDetails,
    addAddress,

    doUserLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            // console.log(userData)
            let admin = await Admin.findOne({
                Email: userData.Email
            })
            let user = await User.findOne({
                Email: userData.Email
            })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('Login sucess');
                        response.user = user
                        // console.log(useremail)
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('User Login failed');
                        resolve({
                            status: false
                        })
                    }
                })
            } else if (admin) {
                if (userData.Password == admin.Password) {
                    console.log("Admin LoggedIn");
                    response.admin = admin
                    response.status = true
                    resolve(response)
                } else {
                    console.log("Admin Login Failed");
                    resolve({
                        status: false
                    })
                }

            } else {
                console.log('Invalid UserId or Password');
                resolve({
                    status: false
                })
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await User.find().lean()
            resolve(users)
            let usercount=await User.count()
            resolve(usercount)
            console.log('User Count: '+usercount);

        })
    },

    addToCart: (proId, userId, quantity) => {
        return new Promise(async (resolve, reject) => {
            let totalObj = await Product.findOne({
                _id: proId
            })
            let perTotal = totalObj.Price
            let qtyObj = await Cart.findOne({
                user_Id: userId
            })
            let usercart = await Cart.findOne({
                user_Id: userId
            })
            console.log(usercart + 'Cart');
            var subtotal = perTotal
            if (usercart) {
                if (qtyObj.cartItems[0]) {
                    let qty = qtyObj.cartItems[0].quantity
                    var subtotal = perTotal * qty
                }

                const prodExist = usercart.cartItems.findIndex(product => product.pro_Id == proId)
                console.log(prodExist);
                if (prodExist != -1) {
                    Cart.updateOne({
                        'cartItems.pro_Id': proId,
                        user_Id: userId
                    }, {
                        $inc: {
                            'cartItems.$.quantity': 1,
                            'cartItems.$.subtotal': perTotal
                        },
                    }).then(() => {
                        resolve()
                    })
                } else {
                    Cart.updateOne({
                        user_Id: userId
                    }, {
                        $push: {
                            cartItems: [{
                                pro_Id: proId,
                                quantity,
                                subtotal
                            }]
                        }
                    }).then((response) => {
                        resolve()
                    })
                }

            } else {
                let cartObj = {
                    user_Id: userId,
                    cartItems: [{
                        pro_Id: proId,
                        quantity,
                        subtotal
                    }]
                }
                Cart.create(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await Cart.findOne({
                user_Id: userId
            })
            if (cart) {
                count = cart.cartItems.length
            }
            resolve(count)
        })
    },
    getTotalPrice: (userId) => {
        return new Promise(async (resolve, reject) => {
            let id = mongoose.Types.ObjectId(userId)
            let cart = Cart.findOne({
                user_Id: userId
            })
            if (cart) {
                let totalAmount = await Cart.aggregate([{
                        $match: {
                            user_Id: id
                        }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            subtotal: '$cartItems.subtotal',
                            shipping: '$cartItems.shipping'
                        }
                    },
                    {
                        $project: {
                            subtotal: 1,
                            shipping: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total_s: {
                                $sum: '$subtotal'
                            },
                            shipp: {
                                $sum: "$shipping"
                            }
                        }
                    },
                    {
                        $addFields: {
                            total: {
                                $sum: ['$total_s', '$shipp']
                            }
                        }
                    },
                ])
                if (totalAmount.length == 0) {
                    resolve({status: true})
                } else {
                    let grandTotal = totalAmount.pop();
                    await Cart.findOneAndUpdate({
                        user_Id: userId
                    }, {
                        $set: {
                            total: grandTotal.total
                        }
                    })
                    resolve({status: true,grandTotal})
                    console.log(grandTotal);
                }
            }

        })
    },
    changeProductQuantity: async (details) => {

        let quantity = parseInt(details.quantity);
        let count = parseInt(details.count);
        let product = await Product.findOne({
            _id: details.product
        })
        console.log(product);
        let price = parseInt(product.Price)
        console.log(price);

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                Cart.updateOne({
                        'cartItems._id': details.cart
                    },

                    {
                        $pull: {
                            cartItems: {
                                pro_Id: details.pro_Id
                            }
                        }
                    }

                ).then((response) => {
                    resolve({
                        removeProduct: true
                    })
                });
            } else {
                if (count == 1) {

                    let qty = quantity + 1;

                    let subtotal = qty * price;
                    Cart.updateOne({
                            'cartItems._id': details.cart,
                            "cartItems.pro_Id": details.product
                        },

                        {
                            $inc: {
                                "cartItems.$.quantity": count
                            },
                            $set: {
                                "cartItems.$.subtotal": subtotal
                            }
                        }
                    ).then((response) => {

                        resolve({
                            status: true
                        })
                    })
                } else {
                    let qty = quantity - 1;

                    let subtotal = qty * price;
                    Cart.updateOne({
                            'cartItems._id': details.cart,
                            "cartItems.pro_Id": details.product
                        },

                        {
                            $inc: {
                                "cartItems.$.quantity": count
                            },
                            $set: {
                                "cartItems.$.subtotal": subtotal
                            }
                        }
                    ).then((response) => {

                        resolve({
                            status: true
                        })
                    })
                }
            }
        })
    },

    placeOrder: (order, products, total) => {
        return new Promise(async(resolve, reject) => {
            console.log(products, total)
            let status = order['PaymentMethod'] ==="COD"?"Placed":"Pending"
            let orderObj ={
                userAddress: {

                    UsersName: order.UsersName,
                    HouseName: order.HouseName,
                    Place: order.Place,
                    State: order.State,
                    Pincode: order.Pincode,
                    Contact: order.Contact

                },

                userId: order.UserId,
                PaymentMethod: order['PaymentMethod'],
                products: products,
                totalAmt: total.grandTotal.total,
                status: status
            }
            await Order.create(orderObj).then((response) => { 
                Cart.deleteOne({user_Id:order.UserId}).then((response)=>{
                    console.log(response)
                    resolve(response)
                })
                resolve(response._id)
            })
        })
    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            id=mongoose.Types.ObjectId(userId)
            let cart=await Cart.aggregate([
                {
                   $match:{user_Id:id}
                },
                {
                      $unwind:'$cartItems'
                },
                {
                    $project:{_id:'$cartItems.pro_Id'}
                }
            ])
            console.log(cart);
            resolve(cart)
        })
    },

    getUserOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const orderDet= await Order.find({userId:userId}).populate('products').lean()
            console.log(orderDet,'Orders');
            console.log(userId,'UserId:');
            resolve(orderDet)
        })
    },

    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            const orderpdt= await Order.find({_id:orderId}).populate('products').lean()
            resolve(orderpdt)
        })
    },

    saveAddress: (details) => {
        return new Promise(async (resolve, reject) => {

            //let status=details['payment-method']==='COD'?'placed':'pending'
            let address = await Address.findOne({
                user: details.userid
            })
            console.log(address + 'yyyyyyyyyyyrr');

            if (address) {

                Address.updateOne({
                    user: details.userid
                }, {
                    $push: {
                        userAddress: [{
                            UsersName: details.UsersName,
                            HouseName: details.HouseName,
                            Place: details.Place,
                            State: details.State,
                            Pincode: details.Pincode,
                            Contact: details.Contact
                        }]
                    }
                }).then((response) => {
                    resolve()
                })


            } else {

                let userObj = {
                    user: details.userid,
                    userAddress: [{

                        UsersName: details.UsersName,
                        HouseName: details.HouseName,
                        Place: details.Place,
                        State: details.State,
                        Pincode: details.Pincode,
                        Contact: details.Contact

                    }],
                    //user:details.userid

                }
                Address.create(userObj).then((response) => {
                    resolve()
                })


            }


        })

    },
    //-----------getAll Address in address select page------------------
    getAllAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await Address.find({
                user: userId
            }).lean().populate('userAddress')
            resolve(address)
        })

    },

    //----------send user Address to place order------------

    sendUserAddress: (addressId) => {
        console.log(addressId, +"-----------------");
        return new Promise(async (resolve, reject) => {
            //let userAddress=await Address.findOne({addressId}).lean()
            let id = mongoose.Types.ObjectId(addressId)
            const addressDetails = await Address.aggregate([{
                        $unwind: "$userAddress"
                    },
                    {
                        $match: {
                            "userAddress._id": id
                        }
                    }
                ]

            )
            resolve(addressDetails[0])
            console.log(addressDetails[0]);
        })
    },
    generateRazorpay: (orderId,total) => {
        return new Promise(async(resolve, reject) => {
            let options={
                amount:total.grandTotal.total*100, 
                currency: "INR",
                receipt:''+orderId
            }

            instance.orders.create(options,function(err,order){
                if(err){
                    console.log(err);
                }
                else{
                    console.log('New Order: ',order);
                    resolve(order)
                }                
               
            })

        })
    },
    verifyPayment:(details)=>{
        return new Promise(async(resolve,reject)=>{
            const crypto=require('crypto')
            const { createHmac } = await import('node:crypto');
            let hash=crypto.createHmac('sha256',process.env.RAZORPAY_KEY)
            hash.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hash=hash.digest('hex')
            if(hash==details['payment[razorpay_signature]']){
                resolve()
            }
            else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            Order.updateOne({_id:orderId},
                {
                    $set:{
                        status:'Placed'
                    }
                }).then(()=>{
                    resolve()
                })
        })
    }
}