var jwt = require('jwt-simple');
var user = require('../controllers/userLogin')

module.exports = {
    tokenValidate: function(req, res, next) {

        try {
            var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
            var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

            if (token || key) {
                console.log("..................Validated...... starts")

                var decoded = jwt.decode(token, require('../config/secret.js')());

                if (decoded.exp <= Date.now()) {
                    console.log("..................Validated...... false")

                    res.status(400);
                    res.json({
                        "status": 400,
                        "message": "Token Expired",
                        "tokenExpired": true
                    });
                    return;
                } else {
                    console.log("..................Validated...... TRUE")

                    next();
                }
            } else {
                console.log("..................Validated...... Invalid TOken")

                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Invalid Token or Key"
                });
                return;
            }
        } catch (err) {
            console.log("..................Validated...... err TOken", err)


            res.status(500);
            res.json({
                "status": 500,
                "message": "Oops something went wrong",
                "error": err
            });
        }

    },
    sessionValidation: function(req, res, next) {
        // console.log("web validation")"

        try {
            if (req.session.userModel) {
                user.getUser(req.session.userModel._id, function(err, user) {
                    if (user) {
                        if (user.status === 'Banned') {
                            console.log("##### Banned User ",req.session.userModel.name)
                            req.session.userModel = undefined;
                        }
                    }
                    next();
                })

            } else {
                next()
            }

        } catch (e) {
            res.render('page404.html',{data: {title: "404 Error", page: "404page"}, session: req.session});
        }


    }
};