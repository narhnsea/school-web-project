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
                if (post.published == true) {
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

    addPost: function (postData) {
        let promise = new Promise((resolve, reject) => {
            if (postData.published === undefined) {
                postData.published = false;
            } else {
                postData.published = true;
            }

            // Setting the next post id
            postData.id = posts.length + 1;
            var today = new Date();
            today = today.toISOString().substring(0, 10);
            postData.postDate = today;
            // Adding to posts
            posts.push(postData);
            resolve(postData);
        });

        return promise;
    },

    getPostsByCategory: function (category) {
        let promise = new Promise((resolve, reject) => {
            const postFilter = posts.filter(post => post.category == category);

            if (postFilter.length > 0) {
                resolve(postFilter);
            } else {
                reject("no results returned");
            }
        });

        return promise;
    },

    getPostsByMinDate: function (minDate) {
        let promise = new Promise((resolve, reject) => {
            const postFilter = posts.filter(post => new Date(post.postDate) >= new Date(minDate));

            if (postFilter.length > 0) {
                resolve(postFilter);
            } else {
                reject("no results returned");
            }
        });

        return promise;
    },

    getPostById: function (id) {
        let promise = new Promise((resolve, reject) => {
            const postFilter = posts.filter(post => post.id == id);
            const uniquePost = postFilter[0];

            if (uniquePost) {
                resolve(uniquePost);
            }
            else {
                reject("no result returned");
            }
        });

        return promise;
    },

    getPublishedPostsByCategory: function (cat) {
        let promise = new Promise((resolve, reject) => {
            const postFilter = posts.filter(post => post.category == cat && post.published == true);
            if (postFilter.length > 0) {
                resolve(postFilter);
            } else {
                reject("no results returned");
            }
        });

        return promise;
    }
};
