const Sequelize = require('sequelize');
var sequelize = new Sequelize('ahoazlbl', 'ahoazlbl', 'UZgTQ-4e5NjY5y81Dpdd8MRy-xK2aCW5', {
    host: 'isilo.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

Post.belongsTo(Category, { foreignKey: 'category' });

module.exports = {
    initialize: function () {
        return new Promise((resolve, reject) => {
            sequelize.sync().then(() => {
                resolve("connected to database");
            }).catch(() => {
                reject("unable to sync the database");
            });
        });
    },

    getAllPosts: function () {
        return new Promise((resolve, reject) => {
            Post.findAll().then(function (data) {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            })
        });

    },

    getPublishedPosts: function () {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    published: true
                }
            }).then(function (data) {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            });
        });

    },

    getCategories: function () {
        return new Promise((resolve, reject) => {
            Category.findAll().then(function (data) {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            })
        });

    },

    addPost: function (postData) {
        return new Promise((resolve, reject) => {
            postData.published = (postData.published) ? true : false;
            for (var x in postData) {
                if (postData[x] == '') postData[x] = null;
            }
            postData.postDate = new Date();
            Post.create(postData).then(() => {
                resolve();
            }).catch((err) => {
                reject("unable to create post");
            });
        });
    },

    getPostsByCategory: function (cat) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    category: cat
                }
            }).then(function (data) {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            });
        });
    },

    getPostsByMinDate: function (minDate) {
        return new Promise((resolve, reject) => {
            const { gte } = Sequelize.Op;
            Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDate)
                    }
                }
            }).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            })
        });
    },

    getPostById: function (id) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    id: id
                }
            }).then((data) => {
                resolve(data[0]);
            }).catch((err) => {
                reject("no results returned.");
            });
        });
    },

    getPublishedPostsByCategory: function (cat) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    published: true,
                    category: cat
                }
            }).then(function (data) {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            });
        });
    },


    addCategory: function (cat) {
        return new Promise((resolve, reject) => {
            for (var x in cat) {
                if (cat[x] == '') cat[x] = null;
            }
            Category.create(cat).then(() => {
                resolve();
            }).catch((err) => {
                reject("unable to create category");
            });
        });
    },


    deleteCategoryById: function (cat) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: { id: cat }
            }).then(() => {
                resolve("destroyed");
            }).catch((err) => {
                reject("unable to destroy category");
            });
        });
    },


    deletePostById: function (postId) {
        return new Promise((resolve, reject) => {
            Post.destroy({
                where: { id: postId }
            }).then(() => {
                resolve("destroyed");
            }).catch((err) => {
                reject("unable to destroy post");
            });
        });
    }
};
