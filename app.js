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
const sass = require('node-sass');

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

const chatSchema = new mongoose.Schema ({
    username: String,
    message: String,
    date: String,
    userid: String,
})


userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)
const Question = new mongoose.model("Question", questionSchema)
const Chat = new mongoose.model("Chat", chatSchema)
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
    res.render("sign-up")
})

app.get("/user", function(req, res){ 
    if(req.isAuthenticated()){  
        User.find().then(function(foundUsers){

            Question.findById( "646af61acecd436c0d1da6f0" ).then( function(foundQuestion) {
            
                Chat.find()
        .then((documents) => {
            res.render("home", {
                user: req.user.username, 
                points: req.user.points, 
                users: foundUsers,
                chats: documents,
                question1: foundQuestion.question1
                , question2: foundQuestion.question2
                , question3: foundQuestion.question3
                , question4: foundQuestion.question4  
            })
        })
        .catch((error) => {
          console.error('Error finding documents:', error);
        });


        })

           
        })
        
    } else {
        res.redirect("/login")
    }
    
})

app.get("/admin", function(req, res){
    if(req.isAuthenticated()){ 
        if(req.user.username === "admin"){

   

   

            User.find().then(function(foundUsers){

                
                
                    Chat.find()
            .then((documents) => {
                res.render("home_admin", {
                    user: "Admin",  
                    users: foundUsers,
                    chats: documents,
                   
                })
            })
            .catch((error) => {
              console.error('Error finding documents:', error);
            });
    
    
            
    
               
            })
        } 
        
        
    } else {
        res.redirect("/login")
    }
})

app.get("/", function(req, res){
    res.render("index")
})



// app.get("/leaderboard", function(req, res){
//     if(req.isAuthenticated()){
//         User.find().then( function(foundUsers){
//             res.render("topper", {user: req.user.username, users: foundUsers})
//         })

//     } else {
//         res.render("index")
//     }
// })

// app.get("/chat", function(req, res){
//     if(req.isAuthenticated()){
//         Chat.find()
//         .then((documents) => {
//             res.render("chat", {user: req.user.username, chats: documents, })
//         })
//         .catch((error) => {
//           console.error('Error finding documents:', error);
//         });
           
       
//     } else {
//         res.render("index")
//     }
    
// })
app.get("/chat", function(req, res){
    if(req.user.username === "admin"){
        res.redirect("/admin")
    } else {
        res.redirect("/user")
    }
    
})

app.get("/create", function(req, res){
    if(req.isAuthenticated()){
        res.redirect("/admin")
    } else {
        res.redirect("/user")
    }
    
})

app.post("/chat", function(req, res){
    if(req.isAuthenticated()){
        const chat = new Chat({
            username: req.user.username,
            message: req.body.message,
            date: req.body.date,
            userid: req.user._id

        })
        chat.save()
        res.redirect("/chat")
    } else {
        res.render("index")
    }
})

app.get("/delete", function(req, res){
    if(req.user.username === "admin"){
        res.redirect("/admin")
    } else {
        res.redirect("/user")
    }
    
})


app.post("/delete", function(req, res){
    if(req.isAuthenticated()){
        if(req.user.username === "admin"){
         
            Chat.findByIdAndDelete(req.body.id).then( function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("deleted")
                }
            })
            res.redirect("/admin")
        }
    } else {
        res.render("index")
    }
})


// app.get("/questions", function(req, res){
    
//     if(req.isAuthenticated()){
//         Question.findById( "646af61acecd436c0d1da6f0" ).then( function(foundQuestion) {
            
//                 res.render("poll", {user: req.user.username, 
//                      question1: foundQuestion.question1
//                     , question2: foundQuestion.question2
//                     , question3: foundQuestion.question3
//                     , question4: foundQuestion.question4                    
//                     , date: foundQuestion.date

//                 })

//                console.log(foundQuestion.question1)
//         })
    
//     } else {
//         res.render("index")
//     }
// })

    
// app.get("/create", function(req, res){
//     if(req.isAuthenticated()){
//         if(req.user.username === "admin"){
//             res.render("create_poll")
//         }else{  
//             res.redirect("/login")
           
//         }
//     }else{
//         res.redirect("/login")
//     }
// })

app.post("/create", function(req,res){
    const filter = { _id: "646af61acecd436c0d1da6f0" };
    const update = {
        question1: req.body.q1,
        answer: req.body.a1,
        question2: req.body.q2,
        answer2: req.body.a2,
        question3: req.body.q3,
        answer3: req.body.a3,
        question4: req.body.q4,
        answer4: req.body.a4,
       
    };

    

    Question.updateOne(filter, update).then( function(){
        console.log("updated")
    })




    res.redirect("/admin")
})  
app.post("/questions", function(req, res){
    if(req.isAuthenticated()){
        
   
    Question.findById( "646af61acecd436c0d1da6f0" ).then( function(foundQuestion) {
        var points = 0
        var correct = 0
            if (req.body.a1 === foundQuestion.answer) {
                points= points+100
                correct = correct+1
            } 

            if (req.body.a2 === foundQuestion.answer2) {
                points= points+100
                correct = correct+1
            } 

            if (req.body.a3 === foundQuestion.answer3) {
                points= points+100
                correct = correct+1
            } 

            if (req.body.a4 === foundQuestion.answer4) {
                points= points+100
                correct = correct+1
            } 
            
            
        

            var update = points + req.user.points
            var filter = req.user._id;
         
            User.findByIdAndUpdate(filter, { points: update })
            .then((result) => {
              console.log('Documents updated:', result.nModified);
            })
            .catch((error) => {
              console.error('Error updating documents:', error);
            });
            
            alert("You got " + correct + " correct and earned " + points + " points")
           
        })
       
        
        res.redirect("/user")
    } else {
        res.redirect("/login")
    }

     
      
})

    
    


app.post("/register", function(req, res){
    User.register({username: req.body.username, email: req.body.email, points: 0}, req.body.password,  function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/user")
            })
        }
    })
})

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password,
       
    })
    req.login(user, function(err){
        if(err){
            console.log(err)
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req, res, function(){

                if(req.user.username === "admin"){
                    res.redirect("/admin")
                } else {
                    res.redirect("/user")
                }
               
                   
                
                
            })
        }
    })
})


app.get("/logout", function(req, res){
    if(req.isAuthenticated()){
        
            req.logout(function(err){
                console.log(err);
            });
            res.redirect("/")
        
    }else{
        res.redirect("/")
    }
    
})


app.listen( process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000")
})