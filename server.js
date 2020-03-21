if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const router = require('express').Router()
const hbs = require('hbs');

const assert=require('assert')
const mongoose = require('mongoose')
const mongo = require('mongodb');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')


const DB_URI = "mongodb://localhost:27017/datad" // mongodb://domain:port/database-name





//Connect to MongoDB
mongoose.connect(DB_URI, { useNewUrlParser: true } )


//CONNECTION EVENTS
mongoose.connection.once('connected', function() {
  console.log("Database connected to " + DB_URI)
})
mongoose.connection.on('error', function(err) {
  console.log("MongoDB connection error: " + err)
})
mongoose.connection.once('disconnected', function() {
  console.log("Database disconnected")
})


initializePassport(passport,function (email) {return users.find(function (user) {
return user.email===email;
    });},

    function (id) {
      return users.find(user => user.id === id);


    }
    )


const users = []
app.set('view-engine', 'hbs')
app.use(express.static('public'));


//to let the server know that we are using ejs



//to get the input from the user .....body.name
app.use(express.urlencoded({ extended: false }))
app.use(flash())


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true, //save if nothing change
  saveUninitialized: true //save with embty value
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
// app.use(function (req,res,next) {
//   res.locals.isAuthenticated =req.isAuthenticated();
//   next();
//
// })



app.get('/Login', checkNotAuthenticated, (req, res) => {
  mongoose.connect(DB_URI,function (error,db) {


    var getdata= db.collection('users').find();
    getdata.forEach(function (doc,err) {
      users.push(doc);


    });

  });
  console.log(users);

  res.render('login.hbs')
})


// app.get('index.html', checkAuthenticated, (req, res) => {
//   res.render('index.html', { name: req.user.name })
// })


//update;;;;;;;;;;;
// app.post('/login',function (req,res,next) {
//
//   var  newuser={
//     id: Date.now().toString(),
//     name: "nawafhapp",
//     email: req.body.email,
//   };
//   var email=req.body.email;
//   mongoose.connect(DB_URI,function (error,db) {
//     db.collection('users').updatetOne({"email":email},{$set:newuser.name},function (err,result) {
//
//       console.log("user is inserted ");
//
//
//     });
//   })
//
// })


app.post('/Login', checkNotAuthenticated, passport.authenticate('local', {

  //if
  successRedirect: 'index2.html',
  ///register.html
  failureRedirect: '/Login',
  failureFlash: true
}))


app.post("/send",function (req,res) {
  if (req.isAuthenticated()) {
    res.redirect('/game.html')
     }
  else{
    res.redirect('/login')
  }

})

app.get('/Logout', (req, res) => {
  req.logout();
  req.session.destroy();

  res.redirect('index.html');
})


app.get('/register.html', checkNotAuthenticated, (req, res) => {

  res.render('register.html')
})

app.post('/register.html', checkNotAuthenticated, async (req, res,next) => {
  try {

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    var  newuser={
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      point : 0
    };
    mongoose.connect(DB_URI,function (error,db) {
      db.collection('users').insertOne(newuser,function (err,result) {

        console.log("user is inserted ");


      });


    })
    res.redirect('/Login')

  } catch {
    res.redirect('/register')
  }

})

// app.delete('/logout', (req, res) => {
//   req.logOut()
//   res.redirect('/login')
// })

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
console.log("port 8080");
app.listen(8080)