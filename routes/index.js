var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

router.get("/", function(req, res) {
   res.render("landing") ;
});

//===============
//AUTH ROUTES
//===============

//show register form
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

//handle register logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        avatar: req.body.avatar,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });
    if(req.body.adminCode === "supreSecretCode123") {
        newUser.isAdmin = true;
    }
    
    User.register(newUser, req.body.password, function(err, user) {
       if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
       passport.authenticate("local")(req, res, function() {
           req.flash("success", "You are signed in " + user.username);
           res.redirect("/campgrounds");
       });
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
       successRedirect: "/campgrounds",
       failureRedirect: "/login",
       failureFlash: true,
        successFlash: 'Welcome to YelpCamp!',
        failureFlash: "Wrong credentials. Try again."
    }), function(req, res) {
});

//logout route
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "You are logged out");
   res.redirect("/campgrounds");
});

//user profile
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

module.exports = router;
