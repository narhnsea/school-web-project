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
var app = express();
var path = require("path");
const port = 8080;

app.use(express.static("public"));

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
	blogService
		.getAllPosts()
		.then(function (posts) {
			res.json(posts);
		})
		.catch(function (err) {
			var reply = { message: err };
			res.json(reply);
		});
});

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
