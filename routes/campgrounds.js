var express = require("express");
var router = express.Router();
var multer = require("multer");
var cloudinary = require("cloudinary");
var Campground = require("../models/campground");
var middleware = require("../middleware");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

//index route – show all campgrounds
router.get("/", function(req, res) {
	Campground.find({}, function(err, allCampgrounds){
		if(err) {
			req.flash("error", err.message);
			res.redirect("*")
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		};
	});
});

//new route to submit campgrounds
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//create route to send new campground to db
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err) {
			req.flash("error", err.message);
			res.redirect("/campgrounds/new");
		} else {
			req.body.campground.image = result.secure_url;
			req.body.campground.image_id = result.public_id;
			req.body.campground.author = {
				id: req.user._id,
				username: req.user.username
			};
			console.log(req.body);
			Campground.create(req.body.campground, function(err, campground) {
				if(err) {
					req.flash("error", err.message);
					return res.redirect("/campgrounds/new");
				} else {
					res.render("campgrounds/show", {campground: campground});
				};
			});
		};
	});
});

//This will be the showpage... NB It must be defined after campground/new else site will assume '/new' is an id not a route
router.get("/:id", function(req, res) {
	//find campgrounds, populate comments from comments db, and then execute function to render page
Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
		if(err) {
			req.flash("error", err.message);
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		};
	});
});


//edit route
router.get("/:id/edit", middleware.isCampgroundAuthor, function(req, res, err){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", err.message);
			res.redirect("/campgrounds/" + req.params.id + "/edit")
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});	
		}
	});
});

//update route
router.put("/:id", middleware.isLoggedIn, upload.single("image"), function(req, res){
	Campground.findById(req.params.id, async function(err, foundCampground) {
		foundCampground.name = req.body.campground.name;
		foundCampground.price = req.body.campground.price;
		foundCampground.description = req.body.campground.description;
		if (req.file) {
			var destroy = await cloudinary.v2.uploader.destroy(foundCampground.image_id).catch((err) => req.flash("error", err.message), res.redirect("/campgrounds/" + req.params.id + "/edit"));;
			var result = await cloudinary.v2.uploader.upload(req.file.path).catch((err) => req.flash("error", err.message), res.redirect("/campgrounds/" + req.params.id + "/edit"));;
			foundCampground.image_id = result.public_id;
			foundCampground.image = result.secure_url;
		};
		foundCampground.save(function(err){
			req.flash("error", err.message);
			res.redirect("/campgrounds/" + req.params.id + "/edit")
		});
		res.redirect("/campgrounds/" + req.params.id)
	});
});

//destroy route
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("/campgrounds/" + req.params.id);
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.image_id).catch((err) => req.flash("error", err.message), res.redirect("/campgrounds"));;
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("/campgrounds");
        }
    }
  });
});

module.exports = router