
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    moment = require("moment"),
    passport = require("passport"),
    LocalSrategy = require("passport-local"),
    Campground = require("./models/campground"),
    methodOverride = require("method-override"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDb = require("./seeds");
    
    app.locals.moment = moment;
    
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index");
    
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDb();
// Comment.remove({}, function(err){
//     if(err) {
        
//     }
// });
// Campground.remove({}, function(err){
//     if(err) {
        
//     }
// });

//PASSPORT CONFIGURATION

app.use(require("express-session")({
    secret: "Once again Rusty wins cuttest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalSrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server started") ;
});