var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var fileUpload=require('express-fileupload') 
const bodyParser=require('body-parser')
const session=require('express-session') 
const multer=require('multer')
const nodemailer=require('nodemailer')

const  config=require('./Config/configmongo')
const productschema=require('./Model/productschema')
const userschema=require('./Model/userschema')


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
// const { partialsDir } = require('express-hbs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:'Key',cookie:{maxAge:600000}}))
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store')
  next()
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{layout:false});
});

module.exports = app;
