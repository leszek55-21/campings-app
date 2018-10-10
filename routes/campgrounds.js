var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


//show all campgrounds
router.get("/", function(req, res) {
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err, allCampgrounds) {
            if(err) {
                console.log("Error: " + err);
            } else {
                res.render("campground/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
            }
        });
    } else {
        Campground.find({}, function(err, allCampgrounds) {
            if(err) {
                console.log("Error: " + err);
            } else {
                res.render("campground/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
            }
        });
    }
});

//adding  campground to database
router.post("/", middleware.isLoggedIn, function(req, res) {
   var name = req.body.newCampground;
   var price = req.body.price;
   var image = req.body.photoUrl;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, price: price, image: image, description: desc, author: author};
   Campground.create(newCampground, function(err, campground) {
      if(err) {
          console.log("Error: " + err);
      } else {
          req.flash("success", "Campground added");
          res.redirect("/campgrounds");
      }
   });
});

//Form for adding new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campground/new"); 
});

//showing specified campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
       if(err) {
          console.log("Error: " + err); 
       } else {
          res.render("campground/show", {campground: foundCampground}); 
       }
    });
   
});

//edit campground

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campground/edit", {campground: foundCampground});
        }
    });
});

//update campground route

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
       if(err) {
           res.redirect("/campgrounds");
       } else {
           req.flash("success", "Campground info updated.");
           res.redirect("/campgrounds/" + req.params.id);
       }
   }); 
});

//destroy route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndRemove(req.params.id, function(err) {
      if(err) {
          res.redirect("/campgrounds");
      } else {
          req.flash("success", "Campground removed");
          res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;