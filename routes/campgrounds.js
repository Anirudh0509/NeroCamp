var express= require("express");
var router= express.Router();
var Camp = require("../models/campground");
var middleware =require("../middleware");
var geocoder= require("geocoder");

//1. Index- Route to show all campground
router.get("/", function(req, res){
   
    var perPage=8;
    var pageQuery = (parseInt(req.query.page)) || 1;
    var pageNumber = pageQuery ? pageQuery :1;
     //fuzzy search for Camps
    if(req.query.search){
        var regex= new RegExp(escapeRegex(req.query.search),"gi");
         //fuzzy search for Camps
         //Pagination
        Camp.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( function(err, allCamps){
            if(err){
                console.log(err);
            }
            Camp.count({name:regex}).exec(function(err, count){
                if(err){
                    console.log(err);
                    res.redirect("back");
                } else{
                    if(allCamps.length<1){
                        req.flash("error", "Campground not found, Try something else");
                        res.redirect("/campgrounds");
                    } 
                    res.render("campgrounds/campgrounds",
                    {
                        campSites:allCamps,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    });
                }
            });
        });
    } else {
         // get all camps from DB
        Camp.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCamps){
            if(err){
                console.log(err);
            }
            Camp.count().exec(function(err, count){
                if(err){
                console.log(err);
                } else {
                    res.render("campgrounds/campgrounds",
                    {
                        campSites:allCamps,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
        });   
    }
});

//3. CREATE- Route to create/add new camp to database
router.post("/", middleware.isLoggedIn, function(req, res){
    var name=req.body.name;
    var price= req.body.price;
    var image= req.body.image;
    var description= req.body.description;
    var author= {
        id:req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
        if(err){
            console.log(err);
        } else {
            var lat= data.results[0].geometry.location.lat;
            var lng= data.results[0].geometry.location.lng;
            var location= data.results[0].formatted_address;
            var newCamp={name: name, image: image, description:description, author:author, price:price, location:location, lat:lat, lng:lng};
            //console.log(req.user);
            Camp.create(newCamp, function(err, allCamps){
               if(err){
                   console.log(err);
                } else {
                   console.log(allCamps);
                   res.redirect("/campgrounds");
               }
            });
        }
    });
});
//2. NEW- route show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");    
});

//4. Show- shows more info about one camp
router.get("/:id", function(req, res) {
    Camp.findById(req.params.id).populate("comment").exec(function(err, foundCamp){
        if(err || !foundCamp){
            req.flash("error", "Camp not found!!");
            res.redirect("/campgrounds");
            console.log(err);
        }else {
            //render the show page with that ground
            res.render("campgrounds/show", {camp:foundCamp});
        }
    });
});

// Edit route
router.get("/:id/edit", middleware.checkCampOwnership, function(req, res) {
        Camp.findById(req.params.id, function(err, camp){
        if(err || !camp){
            req.flash("error", "Campground not found");
           console.log(err);
           res.redirect("campgrounds/");
       } else {
                res.render("campgrounds/edit",{camp:camp});
           } 
       });
});
//Update Route
router.put("/:id", middleware.checkCampOwnership, function(req, res){
    var name=req.body.camp.name;
    var price= req.body.camp.price;
    var image= req.body.camp.image;
    var description= req.body.camp.description;
    geocoder.geocode(req.body.camp.location, function (err, data) {
        if(err){
            console.log(err);
        } else {
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newCampData={name: name, image: image, description:description, price:price, location:location, lat:lat, lng:lng};
            Camp.findByIdAndUpdate(req.params.id, {$set:newCampData}, function(err, updateCamp){
               if(err){
                   console.log(err);
                   res.redirect("/campgrounds");
               } else {
                   res.redirect("/campgrounds/"+ req.params.id);
               }
            });
        }
    });
});
//delete route

router.delete("/:id", middleware.checkCampOwnership, function(req, res){
   Camp.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err); 
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
   });
});
//Fuzzy Search

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}

module.exports= router;
