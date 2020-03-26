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
const path = require('path')

const DB_URI = "mongodb+srv://hassan:123qweasdzxc@project-70hq6.mongodb.net/datad?retryWrites=true&w=majority" // mongodb://domain:port/database-name

const directoryPath= path.join(__dirname, "Public")
const directoryviews= path.join(__dirname, "views")

app.set('view-engine', 'hbs')
app.set('views',directoryviews)
app.use(express.static(directoryPath));
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
         })
     }catch (e) {
         return next()
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


app.get('',checkNotAuthenticated,(req,res)=>{
    if(req.user) {
        res.render('index2.hbs', {
            name: req.user.name,
            level: req.user.level,
            points: req.user.points
        })
    }else{
        res.render('index.hbs')
    }
})


app.get('/login',checkNotAuthenticated, (req, res) => {
    if(req.user){
        res.redirect('/')
    }
    if(req.query.error){
        console.log("sdsdsd")
        res.render('login.hbs',{
            error:'wrong email or password'
        })
    }else {
        res.render('login.hbs')
    }
})


app.post('/login',async (req,res)=> {
    mongoose.connect(DB_URI, async function (error, db) {
        let user = await db.collection('users').findOne({email: req.body.email});
        if(user){
            if(await bcrypt.compare(req.body.password,user.password)){
                let token = jwt.sign({ email: user.email},'ha')
                res.cookie('token',token)
                return res.redirect('/')
            }
        }
        res.redirect('/login?error=nouser')
    })
})

app.get('/game',checkNotAuthenticated,(req,res)=>{
    if(!req.user){
        return res.redirect('/login')
    }
    res.render('game.hbs',{
        name:req.user.name,
        level:req.user.level,
        points:req.user.points
    })
})

app.get('/player' ,checkNotAuthenticated,(req,res)=> {
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
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

let port = process.env.PORT || 4000
const server = app.listen(port,()=> console.log("listening 4000"));

let io = socket(server);

io.on('connection',(socket)=> {
    console.log("dsddds")
    socket.broadcast.emit('opid',{
        opid: socket.id
    });
    socket.on('sendid',(data)=> {
        socket.to(data.opid).emit('opid',{
            opid: socket.id,
            name:data.name,
            level:data.level,
            points:data.points
        });
    });
    socket.on('box', (data)=> socket.to(data.opid).emit('box',data));
    socket.on('info', (data)=> socket.to(data.opid).emit('info',data));
});

