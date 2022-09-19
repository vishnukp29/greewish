# Greewish

## Table of contents

- [Introduction](#introduction)
- [Run](#run)
- [Technology](#technology)
- [Features](#features)
- [License](#license)

## Introduction

 GreeWish is an e-commerce website for selling a variety of plants, pots, plant gifts, gardening tools and fertilizers etc. This website includes a list of modules. There is an admin Section and User Section. Admin can login using predefined user id and password. Admin can control users and products. Users can browse and buy products. There is a payment gateway for payment methods.

## Run

To run this application, you have to set your own environmental variables. For security reasons, some variables have been hidden from view and used as environmental variables with the help of dotenv package. Below are the variables that you need to set in order to run the application:

- key_id:     This is the razorpay key_Id (string).

- key_secret:  This is the razorpay key_Secret (string).

- authToken: This is the Twilio AuthToken (string).

- email:This is the email id used for nodemailer(string)

- password : This is the password used for nodemailer(String)


After you've set these environmental variables in the .env file at the root of the project, and intsall node modules using  `npm install`

Now you can run `npm start` in the terminal and the application should work.

## Technology

The application is built with:

- Node.js 
- Node mailer
- MongoDB
- Express 
- Bootstrap 
- AJAX
- JQuery
- Razorpay

Deployed in AWS EC2 instance with Nginx reverse proxy

## Features

The application displays a plant store that contains plants and plant related products and their information.

Users can do the following:

- Login and signup with OTP verification using nodemailer.
- Through otp verification, the user can manage forgotten passwords.
- Users can change their password and set a new one.
- Users can change their address and personal info.
- Products can be viewed from landing page with categories and Offer price.
- User can Add product to cart.
- User can view single product details.
- Cart with subtotal and grand Total.
- Can Add multiple address including shipping address.
- Category wise render of all products.
- Payment Gateway is integrated with RAZOR PAY.
- The user can cancel the purchased products and the payment is refundable
- User can see the purchase/order history.
- Users can download an invoice of the orders

Admins can do the following:

- Admin login with pre defined credentials.
- Admin Dashboard is implemented with sales reports.
- Admin can handle user block , unblock and delete.
- Can add product and change product details.
- Can add category and sub categories.
- Admin can change the user order status (Confirmed, Delivered).
-  Admin can cancel user orders if it’s pending (status)



## License

[![License](https://img.shields.io/:License-MIT-blue.svg?style=flat-square)](http://badges.mit-license.org)

- MIT License
- Copyright 2022 © [ABDUL AZEEZ TP](https://github.com/AbdulAzeez002)
