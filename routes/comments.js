var express= require("express");
var router = express.Router({mergeParams:true});
var Camp = require("../models/campground");
var Comment= require("../models/comment");
var middleware=require("../middleware");

// Comments Route

router.get("/new", middleware.isLoggedIn, function(req, res) {
    Camp.findById(req.params.id, function(err, camp){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground:camp});
        }
    });
});
router.post("/", middleware.isLoggedIn, function(req, res){
   Camp.findById(req.params.id, function(err, camp) {
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(err, comment){
              if(err){
                  console.log(err);
                  req.flash("error", "Something went wrong");
              } else {
                  //add username and id to comment
                  //save comment
                  comment.author.id= req.user._id;
                  comment.author.username= req.user.username;
                  comment.save();
                  camp.comment.push(comment);
                  camp.save();
                  //console.log(camp._id);
                  req.flash("success", "Successfully added the comment");
                  res.redirect("/campgrounds/"+ camp._id);
              }
           });
       }
   }); 
});
//Edit route
// Campground (campground._id in the action route) is not defined in comments/edit.ejs page. 
//Therefore, the req.params.id sends data of campground._id to variable campground_id in the edit page.
//Similarly, comments._id is not defined.
// Finding comments._id using req.params.comments_id to send id to edit page.
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Camp.findById(req.params.id, function(err, camp) {
       if(err || !camp){
           req.flash("error", "Camp not found");
           res.redirect("/campgrounds");
       } else {
          Comment.findById(req.params.comment_id, function(err, commentFound) {
            if(err){
                console.log(err);
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
            res.render("comments/edit", {campground_id:req.params.id, comment:commentFound});
            }
        }); 
       }
    });
});
//Update Route

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
     if(err){
         console.log(err);
         res.redirect("back");
     }  else {
         res.redirect("/campgrounds/"+ req.params.id);
     }
   });
});
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          console.log(err);
          res.redirect("/campgrounds/"+ req.params.id);
      } else {
          req.flash("success", "Comment removed");
          res.redirect("/campgrounds/"+ req.params.id);
      }
   });
});

module.exports= router;