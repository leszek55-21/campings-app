var express = require("express");
var router = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//showing form for new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
   Campground.findById(req.params.id, function(err, campground) {
       if(err) {
           console.log(err);
       } else {
           res.render("comment/new", {campground: campground});
       }
   });
});

//comment submiting
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to campground
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "You submit a comment");
                   res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});
//edit form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    var campgroundId = req.params.id;
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comment/edit", {campground_id: campgroundId, comment: foundComment});
        }
    });
});
//edit route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if(err) {
          res.redirect("back");
      } else {
          req.flash("success", "Comment updated");
          res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

//destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if(err) {
           res.redirect("back");
       } else {
            req.flash("success", "Comment removed");
            res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

module.exports = router;