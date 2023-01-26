var blogService = require("./blog-service.js");
var express = require("express");
var app = express();
var path = require("path");
const port = 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.redirect("/about");
});

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
		.then(function (value) {
			res.json(value);
		})
		.catch(function (err) {
			res.json({ message: err });
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
			res.json({ message: err });
		});
});

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
