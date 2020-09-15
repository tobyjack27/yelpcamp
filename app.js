var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
require("dotenv").config();
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var multer = require("multer");
var cloudinary = require("cloudinary");
var Campground = require("./models/campground");
var User = require("./models/user");
// var seedDB = require("./seeds");
var Comment = require("./models/comment");

//requiring routes
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");

//db config
mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true, 
	useUnifiedTopology: true, 
	useFindAndModify: false,
	useCreateIndex: true
});

//app config
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//image upload config
// var storage = multer.diskStorage({
//   filename: function(req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   }
// });
// var imageFilter = function (req, file, cb) {
//     // accept image files only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };
// var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: "dni5ifpfb",
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
});

//uncomment to reset the db
//seedDB();

//configure passport
app.use(require("express-session")({
	secret: process.env.PASSPORT_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ //this middleware code will ensure user data is passed into each ejs render
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next(); //must include next in order for process to be continued
}); 

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// required for website to listen for requests
// app.listen(3000, function(){
// 	console.log("Server has started")
// })

app.listen(process.env.PORT, process.env.IP || function(){
	console.log("Server has started")
});