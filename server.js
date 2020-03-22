if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const socket = require('socket.io');
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const jwt = require('jsonwebtoken')
const initializePassport = require('./passport-config')
var cookieParser = require('cookie-parser')


const DB_URI = "mongodb://localhost:27017/datad" // mongodb://domain:port/database-name

app.set('view-engine', 'hbs')
app.use(express.static('public'));
app.use(cookieParser())


//Connect to MongoDB
mongoose.connect(DB_URI, {useNewUrlParser: true})


//CONNECTION EVENTS
mongoose.connection.once('connected', function () {
    console.log("Database connected to " + DB_URI)
})
mongoose.connection.on('error', function (err) {
    console.log("MongoDB connection error: " + err)
})
mongoose.connection.once('disconnected', function () {
    console.log("Database disconnected")
})

initializePassport(passport, function (email) {
        return users.find(function (user) {
            return user.email === email;
        });
        },
    function (id) {
        return users.find(user => user.id === id);
    }
)
 function checkNotAuthenticated (req, res, next){
     try {
         let decoded = jwt.verify(req.cookies.token, 'ha');
         mongoose.connect(DB_URI, async function (error, db) {
             let user = await db.collection('users').findOne({email: decoded.email})
             if (user) {
                 req.user = user
                 return next()
             }
             return res.redirect('/login')
         })
     }catch (e) {
         return res.redirect('/login')
     }
}

let users = []

//to get the input from the user .....body.name
app.use(express.urlencoded({extended: false}))
app.use(flash())


app.use(session({
    secret:'a cool secret',
    resave: true, //save if nothing change
    saveUninitialized: true //save with empty value
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/Login', (req, res) => {
        res.render('login.hbs')
})

app.post('/Login',async (req,res)=> {
    mongoose.connect(DB_URI, async function (error, db) {
        let user = await db.collection('users').findOne({email: req.body.email});
        if(user){
            if(await bcrypt.compare(req.body.password,user.password)){
                let token = jwt.sign({ email: user.email},'ha')
                res.cookie('token',token)
                return res.redirect('/index2.html')
            }
        }
        res.redirect('/login')
    })
})

app.get('/game',checkNotAuthenticated,(req,res)=>{
    res.render('game.hbs')
})

app.get('/player' ,checkNotAuthenticated,(req,res)=> {
    console.log(req.user)
    res.send(req.user)
})

app.get('/Logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login')
})


app.get('/register.html', (req, res) => {
    res.render('register.html')
})

app.post('/register.html', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        var newuser = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            level:0,
            points: 0,
        };
        mongoose.connect(DB_URI, function (error, db) {
            db.collection('users').insertOne(newuser, function (err, result) {
                console.log("user is inserted ");
            });
        })
        res.redirect('/Login')
    } catch {
        res.redirect('/register')
    }
})

let port = process.env.PORT || 4000
const server = app.listen(port,()=> console.log("listening 4000"));

let io = socket(server);

io.on('connection',(socket)=> {
    socket.broadcast.emit('opid',{
        opid: socket.id
    });
    socket.on('sendid',(data)=> {
        socket.to(data.opid).emit('opid',{
            opid: socket.id
        });
    });
    socket.on('box', (data)=> socket.to(data.opid).emit('box',data));
});

