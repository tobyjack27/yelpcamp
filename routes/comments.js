var express = require("express");
var router = express.Router({mergeParams: true});
var multer = require("multer");
var cloudinary = require("cloudinary");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")


// new comment 
router.get("/new", middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			req.flash("error", "Campground cannot be found");
			res.redirect("back");
		} else {
			res.render("comments/new", {campground: campground})
		};
	});
});

// post route
router.post("/", middleware.isLoggedIn, function(req, res) {
	//look up campground using id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			req.flash("error", "Campground cannot be found");
			res.redirect("/campgrounds");
		} else {
			//create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
					req.flash("error", "Something went wrong");
					res.redirect("campgrounds/" + campground._id)
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					//connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					//redirect to campground show page
					req.flash("success", "Comment added")
					res.redirect("/campgrounds/" + req.params.id);
				}
			})
		};
	});	
});

//edit
router.get("/:comment_id/edit", middleware.isCommentAuthor, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			console.log(err);
			req.flash("error", "Comment could not be found");
			res.redirect("back");
		} else {
			res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
		};
	});
});

//update
router.put("/:comment_id", middleware.isCommentAuthor, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err) {
			req.flash("error", "Something went wrong");
			res.redirect("campgrounds/" + req.params.id);
		} else {
			req.flash("success", "Comment updated")
			res.redirect("/campgrounds/" + req.params.id);
		};
	});
});

//destroy
router.delete("/:comment_id", middleware.isCommentAuthor, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("back");
		};
	});
});

module.exports = router;