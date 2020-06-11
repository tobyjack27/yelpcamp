var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	image_id: String,
	description: String,
	author: {id: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, username: String},
	created: {type: Date, default: Date.now},
	comments: [
		{type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"}
	],
	price: String
});

module.exports = mongoose.model("Campground", campgroundSchema);