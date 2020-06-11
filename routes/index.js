var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Root route
router.get("/", function(req, res) {
	res.render("landing");
});


//AUTH ROUTES

// register form
router.get("/register", function(req, res){
	res.render("auth/register");
});

// sign up logic route
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "You have been signed up as " + user.username)
				res.redirect("/campgrounds");
			});
		};
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("auth/login");
});

//login logic
router.post("/login", passport.authenticate("local", ///authenticate checks whether user/password is valid
	{successRedirect: "/campgrounds", //middleware determines where redirect goes depending on success or failure of authentication
	 failureRedirect: "/login"
	}), function(req, res){
	//this callback doesn't really do anything... can delete if you like.
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You have been logged out")
	res.redirect("/campgrounds");
});

module.exports = router;