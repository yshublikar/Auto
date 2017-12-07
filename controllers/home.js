var businessHelper = require('../helpers/businessHelper');
var storeModel = require("../models/store");
var makeModel = require("../models/make");
var experienceModel = require('../models/experience');
var cityModel = require('../models/city');
var _ = require('underscore');

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var moment = require('moment-timezone');

var home = {

    getIndex: function(req, res) {
        var query = {};
        var data = {
            page: 'search',
            title: 'Brand Label',
            activeMenu: 'home',
            city: req.session.userCity
        }
        if (data.city) {
            console.log("city id@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", data.city._id)
            query = { cityId: ObjectId(data.city._id) };
        }
        businessHelper.getCities(function(err, cities) {
            
            if (err) {
                console.log("#### Get Cities Error", err)
                // Render 404 state
                res.render('page404.html',{data: {title: "404 Error", page: "404page"}});
            } else {
                businessHelper.getStores(function(err, stores) {
                    if (err) {
                        console.log("#### Get stores Error", err)
                        // Render 404 state
                        res.render('page404.html',{data: {title: "404 Error", page: "404page"}});
                    } else {
                        makeModel.find({}, function(err, makes) {
                            if (!err) {
                                experienceModel.find({ submitted: true })
                                    .populate({
                                        path: 'storeId',
                                        match: query
                                    })
                                    //.populate('storeId')
                                    .populate('userId', 'name profileImage anonymous avatarImage userId displayName')
                                    .sort({ incidentDate: -1 })
                                    //.limit(6)
                                    .exec(function(err, experiences) {
                                        if (!err) {
                                            //console.log("experiences latest experience**********", experiences)
                                            experiences = experiences.filter(function(doc) {
                                                return doc.storeId
                                            });
                                            data.experiences = experiences;
                                            console.log("experiences latest experience else**********", data.experiences)
                                            data.cities = cities;
                                            data.stores = stores;
                                            data.makes = makes;
                                            data.userDetails = req.session.userModel;
                                            //  console.log("session", req.session.userModel)
                                            //console.log("User DAta", data.userDetails)
                                            res.render('index.html', { data: data });
                                        } else {
                                            // Render 404 state
                                            res.render('page404.html',{data: {title: "404 Error", page: "404page"}});
                                        }
                                    })
                            } else {
                                // Render 404 state
                                res.render('page404.html',{data: {title: "404 Error", page: "404page"}});
                            }
                        })
                    }
                })
            }
        });
    },

    getFeaturedExperiences: function(req, res) {

        city = req.session.userCity;
        console.log('------------ city: ', city);
        if (city) {
            experienceModel.aggregate([{ $match: { submitted: true } },
                {
                    $lookup: {
                        from: "stores",
                        localField: "storeId",
                        foreignField: "_id",
                        as: "storeId"
                    }
                },
                {
                    $unwind: {
                        "path": "$storeId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId"
                    }
                },
                {
                    $unwind: {
                        "path": "$userId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                { $match: { "storeId.cityId": ObjectId(city._id) } },
                { $sort: { "weight": -1 } },
                { $limit: 1 }
            ], function(err, exp) {
                if (exp.length > 0) {
                    res.status(200).json({ status: 'success', message: 'Success', docs: [{ experienceId: exp[0] }] });
                } else {
                    res.status(500).json({ status: 'error', message: 'Failed', docs: [] });
                }
            })
        } else {
            res.status(500).json({ status: 'error', message: 'City not set in session.', docs: [] });
        }
    },

    /*getFeaturedExperiences: function(req, res) {
        var filter = {};
        // filter.storeId = ObjectId(req.params.storeId);
        filter.submitted = true;

        console.log("-------------- filters: ", filter);


        experienceModel.aggregate([{
                    $unwind: {
                        "path": "$posts",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                { $match: filter },
                {
                    $project: {
                        experienceId: "$experienceId",
                        userId: "$userId",
                        posts: "$posts",
                        trendingCount: { $add: [{ $size: "$posts.comments" }, { $size: "$posts.likes" }] },
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        posts: { $addToSet: "$posts" },
                        userId: { $first: "$userId" },
                        experienceId: { $first: "$experienceId" },
                        trendingCount: { $sum: "$trendingCount" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },

                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId"
                    }
                },{
                    "$project": {
                        "storeId": 1,
                        "value": 1,
                        "contain": 1,
                        "childs": {
                            "$filter": {
                                "input": "$childs",
                                "as": "child",
                                "cond": { "$eq": ["$$child.value", "1"] }
                            }
                        }
                    }
                },{
                    $lookup: {
                        from: "store",
                        localField: "storeId",
                        foreignField: "_id",
                        as: "storeId"
                    }
                },
                {
                    $unwind: {
                        "path": "$userId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                { $sort: { trendingCount: -1 } },
                { $skip: 0 },
                { $limit: 5 }
            ],
            function(err, docs) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                } else if (docs.length > 0) {
                    console.log("docs", docs.length)

                    res.status(200).json({ status: "success", message: "Featured experiences for current city.", docs: docs });

                } else {
                    res.status(200).json({ status: "success", message: "Experineces not found", docs: [] });

                }

            })


    },*/

    demo: function(req, res) {

        var markers = [
            { title: 'London Eye, London', lat: 51.503454, long: -0.119562, description: 'The London Eye is a giant Ferris wheel situated on the banks of the River Thames.' },
            { title: 'Palace of Westminster, London', lat: 51.499633, long: -0.124755, description: 'The Palace of Westminster is the meeting place of the House.' }
        ];

        var data = {
            title: 'Brand Label',
            activeMenu: 'home',
            markers: JSON.stringify(markers),
            userDetails: req.session.userModel
        }
        res.render('demo.html', { data: data });
    },
    createStore: function(req, res) {
        var s = new storeModel();
        s.name = 'New location';
        s.location = { type: "Point", coordinates: [-0.119562, 51.503454] }
        s.save(function(err, storeData) {})
    },
    search: function(req, res) {
        console.log('----------- query: ', req.query.q);

        if (req.query.q > 0) {
            storeModel.find({
                "location": {
                    $near: {
                        $geometry: { type: "Point", coordinates: [73.7795371, 18.5625968] },
                        $maxDistance: req.query.q
                    }
                }
            }, function(err, docs) {
                if (!err) {
                    res.status(200).json({ status: 'success', message: 'Success', docs: docs });
                } else {
                    res.status(500).json({ status: 'error', message: 'Failed', docs: err });
                }
            })
        } else {
            console.log("no distance provided in the query.")
            res.status(500).json({ status: 'error', message: 'Failed', docs: [] });
        }
    },

    getModal: function(req, res) {
        res.render('modals/' + req.body.name + ".html", req.body);
    },
    setCity: function(req, res) {
        if (req.body.cityModel) {
            req.session.userCity = req.body.cityModel;
            // req.session.save();
            res.status(200).json({ status: 'success', message: 'Success', doc: req.session.userCity });
        } else {
            res.status(500).json({ status: 'error', message: 'error Input not supplied', doc: null });
        }
    },
}

module.exports = home;