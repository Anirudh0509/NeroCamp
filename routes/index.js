var express= require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var request = require("request");

router.get("/", function(req, res){
    res.render("home");
});

//Authentication Routes
//Register
router.get("/register", function(req, res) {
   res.render("register"); 
});
router.post("/register", function(req, res) {
   const captcha = req.body["g-recaptcha-response"];
    // if user does not select captcha
    if (!captcha) {
      console.log(req.body);
      req.flash("error", "Please select captcha");
      return res.redirect("/register");
    }
    // if user does select captcha
    // secret key
    var secretKey = process.env.CAPTCHA;
    // Verify URL
    var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req
      .connection.remoteAddress}`;
    // Make request to Verify URL
    request.get(verifyURL, (err, response, body) => {
      // if not successful
      if(err){throw err;}
      if (body.success !== undefined && !body.success) {
        req.flash("error", "Captcha Failed");
        return res.redirect("/register");
      }
      
      var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        bio: req.body.bio
      });
    
      User.register(newUser, req.body.password, function(err, user) {
        if (err) {
          console.log(err.message);
          return res.render("register", { error: err.message });
        }
        passport.authenticate("local")(req, res, function() {
          req.flash("success", "Welcome to NeroCamp, Nice to meet you " + user.username);
          res.redirect("/campgrounds");
        });
      });
    });
});

//Login
router.get("/login", function(req, res) {
   res.render("login"); 
});
router.post("/login", passport.authenticate("local", {
    successRedirect:"/campgrounds",
    failureRedirect:"/login",
    failureFlash:true
}), function(req, res){});
//Logout
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Logged you out");
   res.redirect("/campgrounds");
});

module.exports= router;