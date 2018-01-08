var express= require("express"),
    app= express(),
    bodyParser=require("body-parser"),
    mongoose= require("mongoose"),
    flash= require("connect-flash"),
    Camp=require("./models/campground"),
    User= require("./models/user"),
    seedsDB= require("./seeds"),
    methodOverride= require("method-override"),
    Comment= require("./models/comment"),
    passport= require("passport"),
    passportLocal= require("passport-local"),
    passportLocalMongoose= require("passport-local-mongoose"),
    expressSession= require("express-session");
    
    
var campRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");
    
// seedsDB(); Seed the database
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extension:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment=require("moment");

mongoose.connect("mongodb://localhost/nero_camp", {useMongoClient:true});
mongoose.Promise=global.Promise;

//passport Configuration
app.use(expressSession({
    secret:"Camping is Great",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
   res.locals.currentUser=req.user;
   res.locals.error= req.flash("error");
   res.locals.success= req.flash("success");
   next();
});

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/campgrounds", campRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("NeroCamp Server is Started!!"); 
});