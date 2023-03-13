/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ______Nancy Wobo______ Student ID: ___118344209______ Date: _______12-03-2023_________
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
var app = express();
var path = require("path");
const port = 8080;

app.engine(".hbs", exphbs.engine({
	extname: ".hbs",
	helpers: {
		navLink: function (url, options) {
			return '<li' +
				((url == app.locals.activeRoute) ? ' class="active" ' : '') +
				'><a href="' + url + '">' + options.fn(this) + '</a></li>';
		},
		equal: function (lvalue, rvalue, options) {
			if (arguments.length < 3)
				throw new Error("Handlebars Helper equal needs 2 parameters");
			if (lvalue != rvalue) {
				return options.inverse(this);
			} else {
				return options.fn(this);
			}
		},
		formatDate: function (dt) {
			var dateObj = new Date(dt);
			let year = dateObj.getFullYear();
			let month = (dateObj.getMonth() + 1).toString();
			let day = dateObj.getDate().toString();
			return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
		},
		safeHTML: function(context){
			return stripJs(context);
		},
	}
}));

app.set('view engine', '.hbs');
app.use(express.static("public"));

app.use(function (req, res, next) {
	let route = req.path.substring(1);
	app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
	app.locals.viewingCategory = req.query.category;
	next();
});



// Configuring Cloudinary
cloudinary.config({
	cloud_name: "dprntcyx8",
	api_key: "346661439822358",
	api_secret: "9hqHMaUs5yrOE_Bxw2eX1Qxukmg",
	secure: true,
});

// Variable without any disk storage
const upload = multer();

app.get("/", (req, res) => {
	res.redirect("/blog");
});
//setup a 'route' to listen on the default url path
app.get("/about", (req, res) => {
	res.render("about", { layout: "main.hbs" });
});




//posts route
app.get("/posts", function (req, res) {

	if (req.query.category) {

		blogService.getPostsByCategory(req.query.category)
			.then((data) => {
				if (data.length > 0) {
					res.render("posts", { posts: data });
				}
				else {
					res.render("posts", { message: "no results" });
				}
			})
			.catch((err) => {
				res.render("posts", { message: "no results" });
			});

	} else if (req.query.minDate) {

		blogService.getPostsByMinDate(req.query.minDate)
			.then((data) => {
				if (data.length > 0) {
					res.render("posts", { posts: data });
				}
				else {
					res.render("posts", { message: "no results" });
				}
			})

			.catch((err) => {
				res.render("posts", { message: "no results" });
			});

	} else {

		blogService
			.getAllPosts()
			.then(function (data) {
				if (data.length > 0) {
					res.render("posts", { posts: data });
				}
				else {
					res.render("posts", { message: "no results" });
				}
			})
			.catch(function (err) {
				res.render("posts", { message: "no results" });
			});

	}

});

app.get("/posts/add", function (req, res) {
	res.render("addPost", { layout: "main.hbs" });
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
		.then(function (data) {
			if (data.length > 0) {
				res.render("categories", { categories: data });
			}
			else {
				res.render("categories", { message: "no results" });
			}
		})
		.catch(function (err) {
			res.render("categories", { message: "no results" });
		});
});

//blog route
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});


app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogService.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});



//middleware function
app.use(function (req, res, next) {
	res.status(404).render("404",{layout:"main.hbs"});
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
