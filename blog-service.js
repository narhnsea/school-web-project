var fs = require("fs");

var posts = [];
var categories = [];

module.exports = {
    initialize: function () {
        let promise = new Promise(function (resolve, reject) {
            fs.readFile("./data/posts.json", "utf8", (err, data) => {
                if (err) {
                    reject("Error, unable to read posts.json file");
                } else {
                    posts = JSON.parse(data);
                    fs.readFile(
                        "./data/categories.json",
                        "utf8",
                        (err, data) => {
                            if (err) {
                                reject(
                                    "Error, unable to read categories.json file"
                                );
                            } else {
                                categories = JSON.parse(data);
                                resolve("Server initialization successful!");
                            }
                        }
                    );
                }
            });
        });

        return promise;
    },

    getAllPosts: function () {
        let promise = new Promise(function (resolve, reject) {
            if (posts.length > 0) {
                resolve(posts);
            } else {
                reject("no results returned");
            }
        });

        return promise;
    },

    getPublishedPosts: function () {
        let publishedPosts = [];
        let promise = new Promise(function (resolve, reject) {
            for (let i = 0; i < posts.length; i++) {
                var post = posts[i];
                if (post.published == true){
                    publishedPosts.push(post);
                }

                if (publishedPosts.length > 0) {
                    resolve(publishedPosts);
                } else {
                    reject("no results returned");
                }
            }
        });

        return promise;
    },

    getCategories: function () {
        let promise = new Promise(function (resolve, reject) {
            if (categories.length > 0) {
                resolve(categories);
            } else {
                reject("no results returned");
            }
        });

        return promise;
    },
};
