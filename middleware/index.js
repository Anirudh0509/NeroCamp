var Camp= require("../models/campground");
var Comment= require("../models/comment");

var middlewareObj={};

middlewareObj.checkCampOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Camp.findById(req.params.id, function(err, camp){
        if(err || !camp){
           console.log(err);
           req.flash("error", "Camp not found!");
           res.redirect("back");
       } else {
           //if user owns the camp
           if(camp.author.id.equals(req.user._id)){
                next();
           } else {
              req.flash("error", "You don't have the permissions");
              res.redirect("back");
          }
       }
   }); 
  } else {
      req.flash("error", "You need to be logged in to do that");
      res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership=function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment) {
           if(err || !comment){
               console.log(err);
               req.flash("error", "Comment not found!!");
               res.redirect("/campgrounds");
           } else {
               if(comment.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You do no have the permissions to do that");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};
middlewareObj.isLoggedIn=function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports=middlewareObj;