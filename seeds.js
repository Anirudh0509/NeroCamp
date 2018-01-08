var mongoose= require("mongoose");
var Camp=require("./models/campground");
var Comment= require("./models/comment");

var data=[
        {
            name:"Ladakh",
            image:"https://www.justwravel.com/blog/wp-content/uploads/2017/05/1-2.jpg",
            description: " web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
        },
        {
            name:"Tawang",
            image:"http://www.tripmytravel.com/wp-content/uploads/2017/07/Zanskar-and-Ladakh-Mountain-Ranges-wallpaper-1.jpg",
            description: " web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
        },
        {
            name:"Kashmir",
            image:"http://im.hunt.in/cg/jk/Leh/City-Guide/day-leh.jpg",
            description: " web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
        }
    ];
function seedDB(){
    //Remove all campground
    Camp.remove({}, function(err){
        if(err){
            console.log(err);
        } else{
            console.log("remove Campgrounds!!");
            data.forEach(function(seed){
                Camp.create(seed, function(err, campground){
                  if(err){
                      console.log(err);
                  } else {
                      console.log("Added Campgrounds");
                      Comment.create({
                          text:"These are great places",
                          author:"Anirudh"
                      }, function(err, comment){
                          if(err){
                              console.log(err);
                          } else {
                              campground.comment.push(comment);
                              campground.save(function(err){
                                  if(err){
                                      console.log(err);
                                  } else {
                                      console.log("comment created");
                                  }
                              });
                          }
                      })
                  }
                });
            });
        }
    });
}

module.exports=seedDB;