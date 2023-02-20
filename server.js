/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ______Nancy Wobo______ Student ID: ___118344209______ Date: _______08-02-2023_________
*
*  Cyclic Web App URL: https://uninterested-trench-coat-hen.cyclic.app/about
*
*  GitHub Repository URL: _https://github.com/narhnsea/web-322app.git
*
********************************************************************************/

var blogService = require("./blog-service.js");
var express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
var app = express();
var path = require("path");
const port = 8080;

app.use(express.static("public"));

// Configuring Cloudinary
cloudinary.config({
	cloud_name: "",
	api_key: "",
	api_secret: "",
	secure: true,
});

// Variable without any disk storage
const upload = multer();

app.get("/", (req, res) => {
	res.redirect("/about");
});
//setup a 'route' to listen on the default url path
app.get("/about", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/about.html"));
});

//blog route
app.get("/blog", function (req, res) {
	blogService
		.getPublishedPosts()
		.then(function (value) {
			res.json(value);
		})
		.catch(function (err) {
			res.json({ message: err });
		});
});

//posts route
app.get("/posts", function (req, res) {

	if (req.query.category) {

		blogService.getPostsByCategory(req.query.category)
			.then((data) => {
				res.send(data);
			})
			.catch((err) => {
				res.send(err);
			});

	} else if (req.query.minDate) {

		blogService.getPostsByMinDate(req.query.minDate)
			.then((data) => {
				res.send(data);
			})

			.catch((err) => {
				res.send(err);
			});

	} else {

		blogService
			.getAllPosts()
			.then(function (posts) {
				res.json(posts);
			})
			.catch(function (err) {
				var reply = { message: err };
				res.json(reply);
			});

	}

});

app.get("/posts/add", function (req, res) {
	res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), function (req, res) {
	if (req.file) {
		let streamUpload = (req) => {
			return new Promise((resolve, reject) => {
				let stream = cloudinary.uploader.upload_stream(
					(error, result) => {
						if (result) {
							resolve(result);
						} else {
							reject(error);
						}
					}
				);

				streamifier.createReadStream(req.file.buffer).pipe(stream);
			});
		};

		async function upload(req) {
			let result = await streamUpload(req);
			return result;
		}

		upload(req).then((uploaded) => {
			processPost(uploaded.url);
		});

	} else {
		processPost("");
	}

	function processPost(imageUrl) {
		req.body.featureImage = imageUrl;
		let post = {};
		post.body = req.body.body;
		post.title = req.body.title;
		post.postDate = Date.now();
		post.category = req.body.category;
		post.featureImage = req.body.featureImage;
		post.published = req.body.published;
		console.log(post);
		if (post.title) {
			blogService.addPost(post);
		}

		res.redirect("/posts");
	}


});


app.get("/post/:value", (req, res) => {
	blogService.getPostById(req.params.value)
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			res.send(err);
		});
})

//categories route
app.get("/categories", function (req, res) {
	blogService
		.getCategories()
		.then(function (value) {
			res.json(value);
		})
		.catch(function (err) {
			var reply = { message: err };
			res.json(reply);
		});
});

//middleware function
app.use(function (req, res, next) {
	res.status(404).send("Page not found");
});

blogService
	.initialize()
	.then(function (msg) {
		console.log(msg);
		console.log(`Express http server listening on ${port}`);
		app.listen(port);
	})
	.catch(function (err) {
		console.log(err);
	});
