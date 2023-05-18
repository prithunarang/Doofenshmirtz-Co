require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')
const alert= require('alert')

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://prithunarang:Krsna108@e-commerce.ls62ryh.mongodb.net', {useNewUrlParser:true});


const userSchema = new mongoose.Schema ({
    username: String,
    email: String,
    password: String,
    googleId: String,
    points: Number,
});

const questionSchema = new mongoose.Schema ({
    question1: String,
    answer: String,
    question2: String,
    answer2: String,
    question3: String,
    answer3: String,
    question4: String,
    answer4: String,
    question5: String,
    answer5: String,
    date: String,
})


userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)
const Question = new mongoose.model("Question", questionSchema)
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


  


app.get("/login", function(req, res){
    res.render("login")
})

app.get("/register", function(req, res){
    res.render("register")
})

app.get("/", function(req, res){   
    if(req.isAuthenticated()){
        res.render("home", {user: req.user.username})
    } else {
        res.render("index")
    }
})



app.get("/leaderboard", function(req, res){
    if(req.isAuthenticated()){
        User.find({points: points >35000 }, function(err, foundUsers){
            if(err){
                console.log(err)
            } else {
                res.render("leaderboard", {user: req.user.username, users: foundUsers})
            }
        })
    } else {
        res.render("index")
    }
})

app.get("/questions", function(req, res){
    if(req.isAuthenticated()){
        Question.find({}, function(err, foundQuestions){
            if(err){
                console.log(err)
            } else {
                res.render("poll", {user: req.user.username, questions: foundQuestions})
            }
            
        })
    }
})
    
app.get("/create", function(req, res){
    if(req.isAuthenticated()){
        if(req.user.username === "admin"){
            res.render("create_poll")
        }else{  
            res.redirect("/login")
            alert
        }
    }else{
        res.redirect("/login")
    }
})

    
app.post("/questions", function(req, res){
    User.updateOne({_id: req.user._id}, {points: req.body.points}, function(err){
        if(err){
            console.log(err)
        } else {
            res.redirect("/poll")
        }
    })
})

app.post("/register", function(req, res){
    User.register({username: req.body.username, email: req.body.email}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/")
            })
        }
    })
})

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err){
        if(err){
            console.log(err)
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/")
            })
        }
    })
})

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/")
})


app.listen( process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000")
})