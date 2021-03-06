var authController = require("../controllers/authController.js");
var db = require("../models");

module.exports = (app, passport) => {
    app.get("/signup", authController.signup);

    app.get("/signin", authController.signin);

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/signup'
    }));

    app.get("/dashboard", isLoggedIn, authController.dashboard);

    app.get("/jobs", isLoggedIn, authController.jobs);

    app.get("/logout", authController.logout);

    app.post("/signin", passport.authenticate("local-signin", {
        successRedirect: "/dashboard",
        failureRedirect: "/signin"
    }));

    app.get("/articles", isLoggedIn, function (req, res) {
        db.Article.findAll({
            where: {
                userId: req.user.id
            }
        }).then(function (dbarticles) {
            res.render("articles", {
                articles: dbarticles,
                username: req.user
            });
        });
    });

    app.get("/api/goals", isLoggedIn, function (req, res) {
        db.Goal.findAll({
            where: {
                UserId: req.user.id
            }
        }).then(function (dbGoal) {
            res.json(dbGoal);
        });
    });

    app.post("/api/goals", function (req, res) {
        db.Goal.create(req.body).then(function (dbGoal) {
            res.json(dbGoal);
        });
    });

    app.put("/api/goals", function (req, res) {
        db.Goal.update({
                text: req.body.text,
                complete: req.body.complete
            }, {
                where: {
                    id: req.body.id
                }
            })
            .then(function (dbGoal) {
                res.json(dbGoal);
            });
    });

    app.delete("/api/goals/:id", function (req, res) {
        db.Goal.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (dbGoal) {
            res.json(dbGoal);
        });
    });

    app.get("/api/builds", isLoggedIn, function (req, res) {
        db.Build.findAll({
            where: {
                UserId: req.user.id
            }
        }).then(function (dbBuild) {
            res.json(dbBuild);
        });
    });

    app.post("/api/builds", function (req, res) {
        db.Build.create(req.body).then(function (dbBuild) {
            res.json(dbBuild);
        });
    });

    app.put("/api/builds", function (req, res) {
        db.Build.update({
                text: req.body.text,
                complete: req.body.complete
            }, {
                where: {
                    id: req.body.id
                }
            })
            .then(function (dbBuild) {
                res.json(dbBuild);
            });
    });

    app.delete("/api/builds/:id", function (req, res) {
        db.Build.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (dbBuild) {
            res.json(dbBuild);
        });
    });

    app.get("/api/next", isLoggedIn, function (req, res) {
        db.Next.findAll({
            where: {
                UserId: req.user.id
            }
        }).then(function (dbNext) {
            res.json(dbNext);
        });
    });

    app.post("/api/next", function (req, res) {
        db.Next.create(req.body).then(function (dbNext) {
            res.json(dbNext);
        });
    });

    app.put("/api/next", function (req, res) {
        db.Next.update({
                text: req.body.text,
                complete: req.body.complete
            }, {
                where: {
                    id: req.body.id
                }
            })
            .then(function (dbNext) {
                res.json(dbNext);
            });
    });

    app.delete("/api/next/:id", function (req, res) {
        db.Next.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (dbNext) {
            res.json(dbNext);
        });
    });

    app.post("/articles", isLoggedIn, function (req, res) {
        db.Article.create(req.body).then(function (dbarticles) {
            console.log("Saved Article:");
            console.log(dbarticles.dataValues.title);
            console.log("id:  ------------------------------------------------------------------>");
            console.log(dbarticles.dataValues.id);
            console.log("User id:  ------------------------------------------------------------->");
            console.log(dbarticles.dataValues.userId);
            console.log("url:  ----------------------------------------------------------------->");
            console.log(dbarticles.dataValues.url);
            console.log("image:  --------------------------------------------------------------->");
            console.log(dbarticles.dataValues.image);
        });
    });

    app.delete("/articles/:id", function (req, res) {
        console.log("deleting......");
        db.Article.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (dbarticles) {
            db.Article.findAll({}).then(function (dbarticles) {
                var articleobj = {
                    articles: dbarticles
                }
                res.render("articles", articleobj);
                console.log("All articles have been retrieved");
                console.log(dbarticles);
            });
        });
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    };
};