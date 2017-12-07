var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');
var storeModel = require('../models/store');
var makeModel = require('../models/make');
var cityModel = require('../models/city');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var experience = require('../models/experience');
var _ = require('underscore');
var notificationHelper = require('../helpers/emailHelper');
var handlebars = require('handlebars');
var fs = require("fs");
var async = require('async')

var store = {

    details: function(req, res) {

        /*
            storeId
            city
            vanityUrl
        */
        if (req.query.store) {

            storeModel.findOne({ storeId: req.query.store, status: { $in: ["Active", "Approved"] } }).populate('cityId').populate('makeId').exec(function(err, docs) {
                if (docs) {

                    storeModel.aggregate([{
                            $match: {
                                "storeId": docs.storeId
                            }
                        },
                        {
                            $unwind: "$workingHours"
                        },
                        {
                            $group: {
                                _id: { "start": "$workingHours.start", "end": "$workingHours.end", "closed": "$workingHours.closed" },
                                workingHours: { $push: "$workingHours" }
                            }
                        }
                    ], function(err, workingHours) {
                        if (err) {

                            res.render('page404.html', { data: { title: "404 Error", page: "404page" } });

                        } else {
                            // console.log("-------------------response: ", workingHours);
                            businessHelper.getVotes(docs._id, function(count) {
                                // console.log("-------------------response: ", workingHours);
                                var title = docs.name + ' | Brand Label';
                                res.render('store-details.html', { data: { page: 'store-details', title: title, store: docs, workingHours: workingHours, count: count, userDetails: req.session.userModel, city: req.session.userCity } });
                            })
                        }
                    })
                } else if (err) {
                    // Render 404 state
                    res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                }
            })
        } else {
            // Render 404 state
            res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
        }

    },

    getOffer: function(req, res) {
        // console.log("request params: ", req.params);


        makeModel.find({ '_id': req.params.makeId, 'offers._id': req.params.offerId }, { 'offers.$': 1 }).then(function(myDoc) {

            if (myDoc) {

                var offer = myDoc[0].offers[0];
                // console.log("All Data---------*********   :" + offer);
                res.status(200).json({ status: "success", message: "Offer gets Successfully", offer: offer })
            } else if (err) {
                res.status(500).json({ status: "error", message: "Errors while getting Offers" })

            }


        })


    },
    listing: function(req, res) {
        res.render('store-listing.html', { data: { title: 'Stores | Brand Label', userDetails: req.session.userModel, city: req.session.userCity } });
    },
    demo: function(req, res) {
        // console.log('----------- query: ', req.query.q);

        storeModel.find()
            .populate({
                path: 'makeId',
                match: {
                    makeId: { $eq: 2 }
                }
            })
            .exec(function(err, docs) {

                if (!err) {
                    // console.log("----------- Data : ", docs);
                    docs = docs.filter(function(doc) {
                        return doc.makeId; // return only users with email matching 'type: "Gmail"' query
                    });

                    res.status(200).json({ status: 'success', message: 'Success', docs: docs });
                } else {
                    res.status(500).json({ status: 'error', message: 'Failed', docs: err });
                }
            })
    },
    getStores: function(req, res) {

        var condition = { name: new RegExp(req.query.q, "i"), cityId: req.params.city, status: { $in: ["Active", "Approved"] } }
        if (req.query.type && req.query.type != 'null' && req.query.type != 'undefined' && req.query.type != 'dealership-workshop') {
            condition.type = { $regex: new RegExp(req.query.type, "i") };
        }
        // console.log("------------ req.query.type: ", req.query.type);
        // console.log("------------ condition: ", condition);

        storeModel.find(condition)
            .limit(5)
            .exec(function(err, stores) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Errors while getting stores" })
                } else {
                    res.status(200).json({ status: "success", message: "Stores gets", docs: stores })
                }
            })
    },
    getStoresByIds: function(req, res) {

        if (req.body.storeIds && req.body.storeIds.length > 0) {

            storeModel.find({
                _id: { $in: req.body.storeIds }
            }, function(err, stores) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Errors while getting stores" })
                } else {
                    res.status(200).json({ status: "success", message: "Stores gets", docs: stores })
                }
            })
        } else {
            res.status(500).json({ status: "error", message: "Input is not proper." })
        }
    },
    getAllByMake: function(req, res) {
        // req.params.name
        // req.params.storeType
        // req.params.city

        // console.log(" getAllByMake------------- params: ", req.params);

        var resQuery = {};
        var queryCondition = { status: { $in: ["Active", "Approved"] } }

        if (req.params.name != undefined && req.params.name != '') {
            // Send specific stores against make

            var condition = { status: { $in: ["Active", "Approved"] } };
            if (req.params.storeType && req.params.storeType != 'dealership-workshop') {
                condition.type = new RegExp(req.params.storeType, "i");
            }
            if (req.session.userCity && req.session.userCity._id) {
                condition.cityId = ObjectId(req.session.userCity._id);
                resQuery.cityName = req.session.userCity.name;
                resQuery.cityId = req.session.userCity._id;
            }
            // console.log("----------- condition: ", condition)
            storeModel.find(condition)
                .populate({
                    path: 'makeId',
                    match: {
                        vanityUrl: new RegExp(req.params.name, "i")
                    }
                })
                .exec(function(err, docs) {
                    if (docs) {
                        docs = docs.filter(function(doc) {
                            return doc.makeId; // return only users with email matching 'type: "Gmail"' query
                        });
                        // console.log("--------- Docs: ", docs);
                        var data = {
                            userDetails: req.session.userModel,
                            city: req.session.userCity
                        };
                        data['page'] = 'store-listing';
                        data['title'] = 'Stores | Brand Label';
                        /*   data['query'] = {
                               make: req.params.name,
                               storeType: new RegExp(req.params.storeType, "i"),

                           }*/
                        resQuery.storeType = req.params.storeType;

                        /*  store.getAllStores(queryCondition, function(result) {
                              if (result.storeCount) {

                                  resQuery.storeCount = result.storeCount;*/
                        makeQuery = { "vanityUrl": new RegExp(req.params.name, "i") };

                        store.getMake(makeQuery, function(make) {
                            resQuery.make = make;
                            data['stores'] = docs;
                            data['query'] = resQuery;
                            res.render('store-listing.html', { data: data });
                        })

                        /*    }
                        })*/

                    } else if (err) {
                        // Render 404 state
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    } else {
                        // Render 404 state
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    }
                })
        } else {
            // Send all stores or nothing
            // console.log("--------- Send all stores or nothing");
            res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
        }
    },

    searchByCity: function(req, res) {

        /*
            cityId
            type
            searchField
            make

        */
        var resQuery = {};
        var queryCondition = { status: { $in: ["Active", "Approved"] } }
        var condition = { status: { $in: ["Active", "Approved"] } };
        async.waterfall([
            function(callback) {
                if (req.query.city != undefined) {
                    cityModel.findOne({ cityId: req.query.city }, function(err, city) {
                        if (err) {
                            callback(err, null)
                        } else {
                            condition.cityId = ObjectId(city._id);
                            callback(null, null)

                        }
                    })
                } else if (req.session.userCity && req.session.userCity._id) {
                    condition.cityId = ObjectId(req.session.userCity._id);
                    callback(null, null)
                } else {
                    callback("City is not selected.", null)

                }
            }
        ], function(err, result) {

            if (err) {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                return;
            }
            if (req.query.type && req.query.type != 'dealership-workshop') {
                condition.type = new RegExp(req.query.type, "i");
            }

            if (req.query.searchField != undefined && req.query.searchField != "") {
                condition.name = { $regex: req.query.searchField, $options: "i" }; //"/" + req.query.searchField + "/"
            }
            // console.log("-----------------condition", condition)
            // Send specific stores against make

            var makeCondition = { path: 'makeId' };
            if (req.query.make) {
                makeCondition = {
                    path: 'makeId',
                    match: {
                        vanityUrl: new RegExp(req.query.make, "i")
                    }
                }
            }
            storeModel.find(condition)
                .populate(makeCondition)
                .exec(function(err, docs) {
                    if (docs) {
                        if (req.query.make) {
                            docs = docs.filter(function(doc) {
                                return doc.makeId;
                            });
                        }

                        var cityCondition = (req.session.userCity && req.session.userCity._id) ? { _id: req.session.userCity._id } : {}
                        cityModel.findOne(cityCondition, function(err, city) {

                            var data = {
                                userDetails: req.session.userModel,
                                city: (cityCondition._id) ? city : null
                            };
                            data['page'] = 'store-listing';
                            data['title'] = 'stores | Brand Label';
                            if (req.query.type) {
                                if (req.query.type == 'dealership-workshop') {
                                    resQuery.storeType = "Dealership, Workshop";
                                } else if (req.query.type == 'dealership') {
                                    resQuery.storeType = 'Dealership';
                                } else if (req.query.type == 'workshop') {
                                    resQuery.storeType = 'Workshop';
                                }
                            } else {
                                resQuery.storeType = "Dealership, Workshop";
                            }

                            resQuery.cityName = req.params.city.charAt(0).toUpperCase() + req.params.city.slice(1);;
                            resQuery.cityId = condition.cityId;

                            /*store.getAllStores(queryCondition, function(result) {
                                if (result.storeCount) {
                                    resQuery.storeCount = result.storeCount;*/
                            console.log("Documents!!!!!!!!!", docs)
                            data['stores'] = docs;
                            data['query'] = resQuery;

                            if (req.query.make) {
                                makeQuery = { "vanityUrl": new RegExp(req.query.make, "i") };
                                store.getMake(makeQuery, function(make) {
                                    resQuery.make = make;
                                    data['query'] = resQuery;
                                    res.render('store-listing.html', { data: data });
                                })
                            } else {
                                res.render('store-listing.html', { data: data });
                            }
                        })
                        /*     }
                         })*/

                    } else if (err) {
                        // Render 404 state
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    } else {
                        // Render 404 state
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    }
                })
        })
        /* } else {
             // Send all stores or nothing
             console.log("--------- Send all stores or nothing");
             res.render('page404.html');
         }*/


    },
    getStoresByCity: function(req, res) {
        // console.log("getStoresByCity------------- params: ", req.params);

        var resQuery = {};
        var queryCondition = { status: { $in: ["Active", "Approved"] } }

        var condition = {
            $or: [{
                type: new RegExp(req.params.storeType, "i")
            }],
            status: { $in: ["Active", "Approved"] }
        }
        if (req.session.userCity && req.session.userCity._id) {
            condition['$or'].push({ cityId: ObjectId(req.session.userCity._id) })
        }

        // console.log('--------- Condition: ', condition);
        storeModel.find(condition)
            .populate('makeId')
            .exec(function(err, docs) {
                if (docs) {
                    docs = docs.filter(function(doc) {
                        return doc.makeId; // return only users with email matching 'type: "Gmail"' query
                    });
                    // console.log("--------- Docs: ", docs);
                    var data = {
                        userDetails: req.session.userModel,
                        city: req.session.userCity
                    };
                    data['page'] = 'store-listing';
                    data['title'] = 'Stores | Brand Label';
                    console.log("storeType!!!!!!!!!!!!!!!!!!!", req.params.storeType)
                    resQuery.storeType = req.params.storeType;
                    resQuery.cityName = req.params.city.charAt(0).toUpperCase() + req.params.city.slice(1);;

                    /*store.getAllStores(queryCondition, function(result) {
                        if (result.storeCount) {
                            resQuery.storeCount = result.storeCount;*/
                    data['stores'] = docs;
                    data['query'] = resQuery;
                    res.render('store-listing.html', { data: data });
                    /*      }
                      })*/

                } else if (err) {
                    // Render 404 state
                    res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                } else {
                    // Render 404 state
                    res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                }
            })


    },

    /*    getAllStores: function(query, callback) {
            storeModel.find(query, function(err, doc) {
                if (!err && doc) {
                    callback({ "storeCount": doc.length });
                }
            })
        },*/

    getMake: function(query, callback) {
        makeModel.findOne(query, function(err, docs) {
            if (!err && docs) {
                callback({ "_id": docs._id, "name": docs.name });
            }
        })
    },

    getFilteredStores: function(req, res) {

        /*
            req.body = {
                make: '',
                storeType: '',
                distanceRange: '',
                overallRating: '',
                recommendationRate: '',
                offersOnly: ''
            }
            73.7795926, 18.5626376 - My coordinates for demo
        */
        console.log("inside filter", req.body)
        var resQuery = {};
        var queryCondition = {};

        // console.log("--------- body: ", req.body);
        var condition = { status: { $in: ["Active", "Approved"] } }
        var makeCondition = {};

        if (req.body.make !== '' && req.body.make !== undefined) {
            // console.log("makessss", req.body.make)
            makeCondition = {
                path: 'makeId',
                match: {
                    _id: {
                        $in: req.body.make
                    }
                }
            };
        } else {
            makeCondition = { path: 'makeId' };
        }

        if (req.body.storeType !== undefined && req.body.storeType !== '' && req.body.storeType !== 'dealership-workshop') {
            condition.type = new RegExp(req.body.storeType, "i");
            // console.log("----------- type: ", req.body.storeType);
            // queryCondition = { status: { $in: ["Active", "Approved"] }, type: condition.type}
            queryCondition = { status: { $in: ["Active", "Approved"] } }
        } else {
            queryCondition = { status: { $in: ["Active", "Approved"] } }
        }

        if (req.body.city.id != "" && req.body.city.id != undefined) {
            condition.cityId = ObjectId(req.body.city.id);
        }

        if (req.body.overallRating > 0) {
            // console.log("----------- overallRating: ", req.body.overallRating);
            condition.overallRating = { $gte: (parseInt(req.body.overallRating) - 0.5) };
        }

        if (req.body.recommendationRate > 0) {
            console.log("----------- recommendationRate: ", req.body.recommendationRate);
            condition.recommendedScore = { $lte: parseInt(req.body.recommendationRate) }
        }

        // console.log("--------- Condition: ", condition);
        if (req.body.storeType) {
            if (req.body.storeType == 'dealership-workshop') {
                resQuery.storeType = "Dealership, Workshop";
            } else if (req.body.storeType == 'dealership') {
                resQuery.storeType = 'Dealership';
            } else if (req.body.storeType == 'workshop') {
                resQuery.storeType = 'Workshop';
            }
        } else {
            resQuery.storeType = "Dealership, Workshop";
        }




        // console.log("----------- distanceRange: ", req.body.distanceRange);

        cityModel.findOne({ _id: req.body.city.id }, function(err, doc) {
            // console.log("city@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", doc)
            if (!err && doc) {
                if (req.body.distanceRange > 0) {
                    condition.location = {
                        $near: {
                            $geometry: { type: doc.location.type, coordinates: [doc.location.coordinates[1], doc.location.coordinates[0]] },
                            $maxDistance: req.body.distanceRange * 1000
                        }
                    }
                }
                console.log("condition", condition)
                resQuery.cityName = doc.name;
                resQuery.cityId = doc._id;
                storeModel.find(condition)
                    .populate(makeCondition)
                    .exec(function(err, docs) {
                        if (docs) {
                            // console.log('---------- Docs: ', docs)
                            if (req.body.make !== '' && req.body.make !== undefined) {
                                docs = docs.filter(function(doc) {
                                    return doc.makeId; // return only users with email matching 'type: "Gmail"' query
                                });
                            }
                            /*store.getAllStores(queryCondition, function(result) {
                                if (result.storeCount) {
                                    resQuery.storeCount = result.storeCount;
                                    res.status(200).json({ status: "success", docs: docs, "query": resQuery })
                                }
                            })*/
                            res.status(200).json({ status: "success", docs: docs, "query": resQuery })
                        } else if (err) {
                            // Render 404 state
                            res.status(500).json({ status: "error", docs: [] })
                        } else {
                            // Render 404 state
                            res.status(500).json({ status: "error", docs: [] })
                        }
                    })



            }
        })
    },

    //---------------  Ajax requested methods ---------------------

    getStoreExperinces: function(req, res) {
        var skip = req.query.skip ? parseInt(req.query.skip) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 5;
        var startFrom = req.query.startFrom ? parseInt(req.query.startFrom) : 1;
        filter = {};
        // if (req.query.filterBy == 'All') {
        //     filter = {}
        // }
        // if (req.query.filterBy == 'New') {
        //     filter = { createdAt:  new Date() }
        // }


        if (req.query.filterBy == 'Worst') {
            filter = { "posts.rating": { $lte: 2 } };

        }
        if (req.query.filterBy == 'Best') {
            filter = { "posts.rating": { $gte: 4 } };

        }
        filter.storeId = ObjectId(req.params.storeId);
        filter.submitted = true;
        // filter.status = { $in: ["Active", "Approved"] };
        // console.log("filter", filter)

        experience.count(filter, function(err, expCount) {

            var sort = { createdAt: -1 };
            if (req.query.filterBy == 'Activity') {
                sort = { "posts.postedOn": -1 }
            }
            if (req.query.filterBy == 'Trending') {
                sort = { weight: -1 }
            }
            console.log(sort)
            experience.aggregate([{
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
                            // trendingCount: { $add: [{ $size: "$posts.comments" }, { $size: "$posts.likes" }] },
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                            weight: "$weight",
                            storeId: "$storeId",
                        }
                    },

                    {
                        $group: {
                            _id: "$_id",
                            posts: { $addToSet: "$posts" },
                            userId: { $first: "$userId" },
                            experienceId: { $first: "$experienceId" },
                            // trendingCount: { $sum: "$trendingCount" },
                            createdAt: { $first: "$createdAt" },
                            updatedAt: { $first: "$updatedAt" },
                            storeId: { $first: "$storeId" },
                            weight: { $first: "$weight" }

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
                    { $sort: sort },
                    { $skip: skip },
                    { $limit: limit }
                ],
                function(err, docs) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                    } else if (docs.length > 0) {
                        // console.log("docs", docs.length)

                        var html = "";
                        _.each(docs, function(item) {
                            // if (req.query.filterBy != 'Activity') {
                            //     item.posts.sort(function(post1, post2) { return new Date(post1.postedOn) < new Date(post2.postedOn) })
                            // }

                            html += getHtml(req, item);
                        });
                        res.status(200).json({ status: "success", message: "Html generated", html: html, pagination: getPagination(expCount, limit, skip, startFrom) });

                    } else {
                        res.status(200).json({ status: "success", message: "Experineces not found", html: '<li><a href="javascript:;" class="activity-res-single clearfix"><span class="act-title">No Data found.</span><span class="act-published"></span></a></li>', pagination: '' });

                    }

                })

        })

    },
    getStoreInfolytics: function(req, res) {
        experience.aggregate([{ $match: { storeId: ObjectId(req.params.storeId), submitted: true } },
                { $unwind: "$formSnapshots" },
                { $unwind: "$formSnapshots.questionGroupData" },
                {
                    $group: {
                        _id: "$formSnapshots.questionGroupData.groupType",
                        totalValue: { $sum: "$formSnapshots.questionGroupData.value" },
                        store: { $addToSet: "$storeId" },
                        count: { $sum: 1 }

                    }
                },
                {
                    $unwind: {
                        "path": "$store",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "stores",
                        localField: "store",
                        foreignField: "_id",
                        as: "store"
                    }
                },
                {
                    $unwind: {
                        "path": "$store",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "grouptypes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "groupType"
                    }
                },
                {
                    $unwind: {
                        "path": "$groupType",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        store: "$store",
                        groupId: "$groupType._id",
                        type: "$groupType.name",
                        percentage: {
                            $multiply: [{ $divide: ["$totalValue", { $multiply: ["$count", 100] }] }, 100]
                        },

                    }

                }

            ],
            function(err, docs) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                } else {
                    console.log("---------- docs", docs);
                    var output = [];
                    _.each([config.amenities, config.integrity, config.qualityOfWork, config.customersServices], function(grp) {
                        var grpData = _.find(docs, function(obj) { return obj.groupId + "" == grp + "" });
                        if (!grpData) {
                            var type = grp === config.amenities ? "AMENITIES" : grp === config.integrity ? "INTEGRITY" : grp === config.qualityOfWork ? "QUALITY OF WORK" : grp === config.customersServices ? "CUSTOMER SERVICE" : "";

                            //output.push({ type: type, percentage: 0, store: { recommendedScore: 0, overallRating: 0 } })

                            //To display recommendedScore and OverAllRating 
                            output.push({ type: type, percentage: 0, store: { recommendedScore: (docs.length > 0 && docs[0].store.recommendedScore ? docs[0].store.recommendedScore : 0), overallRating: (docs.length > 0 && docs[0].store.overallRating ? docs[0].store.overallRating : 0) } })
                        } else {
                            output.push(grpData)
                        }

                    })
                    output.sort();
                    res.status(200).json({ status: "success", message: "Infolytics generated successfully", docs: output });

                }

            })
    },
    getGraphData: function(req, res) {
        experience.find({ storeId: ObjectId(req.params.storeId), submitted: true }, { "posts": 1 },
            function(err, docs) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                } else {
                    var allPosts;
                    _.each(docs, function(exp) {
                        allPosts = _.union(allPosts, exp.posts);
                    })
                    var formattedData = {};
                    for (var i = moment().clone().startOf('year'); i < moment().clone().endOf('year'); i = moment(new Date(i)).add(1, 'month')) {
                        var data = _.filter(allPosts, function(post) {
                            return post.postedOn <= moment(new Date(i)).clone().endOf('month')
                        });
                        var percentage = 0;
                        if (data.length > 0) {
                            var rates = _.pluck(data, 'rating');
                            var totalRating = _.reduce(rates, function(memo, num) { return memo + num; }, 0)
                            percentage = ((totalRating * 100) / (data.length * 5));
                        }
                        formattedData[moment(new Date(i)).format('MMM')] = percentage.toFixed(2);
                    }
                    var currentYear = new Date().getFullYear();
                    res.status(200).json({ status: "success", message: "graph generated successfully", doc: formattedData, statisticYear: currentYear });

                }

            })
    },
    addStore: function(req, res) {
        // console.log("place data: ", req.body);

        var storeData = {};
        storeData.adddress = req.body.formatted_address || "";
        storeData.phone = req.body.formatted_phone_number || "";
        if (req.body.geometry && req.body.geometry.location) {
            storeData.longitude = req.body.geometry.location.lng || "";
            storeData.latitude = req.body.geometry.location.lat || "";
        }
        storeData.name = req.body.name || "";
        storeData.website = req.body.website || "";
        storeData.type = req.body.type


        var headers = {};
        var templateVars = {};
        headers.to = config.headers.to;
        headers.from = config.headers.from;
        headers.subject = "Request for add new store.";

        var sendStoreData = {
            "name": storeData.name,
            "phone": storeData.phone,
            "address": storeData.adddress,
            "latitude": storeData.latitude,
            "longitude": storeData.longitude,
            "website": storeData.website,
            "type": storeData.type,
            "url": BASE_URL,
            "logo": BASE_URL + "/img/logo.png"
        }


        var source = "./views/templates/newStore.html";

        fs.readFile(source, 'utf8', function(err, data) {
            if (err) {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                // res.status(500).json({ status: 'error', message: "Cannot read Contents", doc: "" });
            } else {
                var template = handlebars.compile(data);
                var result = template(sendStoreData);
                templateVars.emailMessage = result;
                notificationHelper.sendEmail(headers, templateVars, function(email) {
                    // res.redirect('/contact');
                    // console.log("email:", email);
                    if (email.status === 200) {
                        console.log("in success:");
                        res.status(200).json({ status: 'success', message: 'Request for add new store has been sent successfully' });
                    } else {
                        console.log("in error function", err)
                        res.status(500).json({ status: 'error', message: 'Email not send' });

                    }
                });
            }

        });

    },

    trackStoreVisitCount: function(req, res) {
        if (req.params.storeId && req.params.userId) {

            storeModel.findOneAndUpdate({ _id: ObjectId(req.params.storeId) }, { $addToSet: { visitedCount: req.params.userId } }, function(err, doc) {
                if (!err) {
                    res.status(200).json({ status: "success", message: "User visit count recorded." });
                } else {
                    res.status(200).json({ status: "Error", message: "Error while recording user visit count." });
                }
            })
        }
    }
}

module.exports = store;

function getHtml(req, data) {
    if (data.posts.length > 0) {
        console.log("data.posts.length", data.posts.length)
        var html = '<li><div class="experience-cont-single" id="experience">';

        if (data.isRecommended) {
            html += "<div class='reccomented-float'><span>Recommended</span><span class='btm-arrow'></span></div>";
        }
        if (data.posts[data.posts.length - 1].title) {
            html += "<h5 class='linkify'>" + data.posts[data.posts.length - 1].title + "</h5>";
        } else {
            html += "<h5></h5>";
        }
        if (data.posts[0].rating) {
            html += '<div class="rating-cont">';
            html += "<ul class='start-rating'>";
            for (var i = 0; i < 5; i++) {

                if (i < data.posts[0].rating) {
                    html += "<li class='active'><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
                } else {
                    html += "<li><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
                }
            }
            html += "</ul></div>";

            // html += "<li class='active'><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
            // html += "<li class='active'><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
            // html += "<li class='active'><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";

        }
        if (data.posts[data.posts.length - 1].description) {
            html += "<p class='linkify'>" + data.posts[data.posts.length - 1].description + "<a target='_blank' class='learn-more-link' href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (data.storeId && data.storeId.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(data.posts[0].title) + '?experience=' + data.experienceId) + "'>Read Details <i class='fa fa-angle-right' aria-hidden='true'></i></a></p>";
        } else {
            html += "<p class='linkify'>" + data.posts[data.posts.length - 1].description + "<a target='_blank' class='learn-more-link' href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (data.storeId && data.storeId.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(data.posts[0].title) + '?experience=' + data.experienceId) + "'>Read Details <i class='fa fa-angle-right' aria-hidden='true'></i></a></p>";
        }
        html += "<div class='post-details-all clearfix'>";
        html += "<ul class='post-details'>";
        var setClass = '';

        if (req.session.userModel && data.posts[data.posts.length - 1].likes.findIndex(x => x.like == req.session.userModel._id) != -1) {
            setClass = 'active';
        }
        html += '<li id="' + data.posts[data.posts.length - 1]._id + '"><a href="javascript:;" class="fb-btn ' + setClass + '" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Tooltip contents goes1 here" onclick="likePost(\'' + "Post" + '\',\'' + (req.session.userModel && req.session.userModel._id) + '\',\'' + data._id + '\',\'' + data.posts[data.posts.length - 1]._id + '\',\'' + "likes" + '\')"><i class="fa fa-thumbs-up" aria-hidden="true"></i> Like <span>(' + data.posts[data.posts.length - 1].likes.length + ')</span></a></li>';

        html += "<li><a href='javascript:;' data-toggle='popover' data-html='true' data-placement='bottom' title='' onclick='showPopover()'><i class='fa fa-share-alt' aria-hidden='true'></i>Share</a></li>";
        html += "<li><a href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (data.storeId && data.storeId.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(data.posts[0].title) + '?experience=' + data.experienceId) + "'><i class='fa fa-comments' aria-hidden='true'></i> Comments <span>(" + data.posts[0].comments.length + ")</span></a></li>";
        html += "<li><a href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (data.storeId && data.storeId.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(data.posts[0].title) + '?experience=' + data.experienceId) + "' ><i class='fa fa-refresh' aria-hidden='true'></i> Updates <span>(" + (data.posts ? data.posts.length - 1 : 0) + ")</span></a></li>";

        html += "</ul>";

        html += "<div class='exp-user'>";
        html += "<div class='user-details clearfix'>";
        html += "<span class='profile-img'>"
        html += '<img src="' + config.BASE_URL + (data.userId && data.userId.anonymous ? data.userId.avatarImage : (data.userId ? data.userId.profileImage : '')) + '" alt="" onerror="this.src=\'' + config.BASE_URL + 'img/user-demo.png\'"> <a class="text-hover-green" href="' + (BASE_URL + 'profile/' + (data.userId && data.userId.userId)) + '">' + (data.userId && data.userId.anonymous ? data.userId.displayName : (data.userId ? data.userId.name : 'Unknown User'))
        html += "</a></span>";
        html += "</div>"
        html += "<span class='posted'>Posted " + moment(data.posts[data.posts.length - 1].postedOn).tz('Asia/Kolkata').format('llll') + "</span>";
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "</li>";
    }
    return html || "";
};

function getPagination(count, limit, skip, startFrom) {
    if (count < limit) {
        return "";
    }
    var pageNo = "";
    if (skip > 0) {
        pageNo = "<li class='go-prev' onclick='prevPage(" + limit + ")'><a href='javascript:;'><i class='fa fa-angle-left' aria-hidden='true'></i></a></li>";
    }
    var skip1 = 0;
    var mid = (count / limit);
    mid = mid + "";
    if (mid.indexOf('.') > -1) {
        mid = parseInt(mid) + 1;
    }
    var isMore = false;
    var isLess = false;

    for (var i = startFrom; i <= mid; i++) {
        if (startFrom > 10) {
            if (!isLess) {
                pageNo += "<li id=" + i + " onclick='less(" + skip1 + "," + limit + "," + i + ")' class='dotted'><a href='#''>...</a></li>"
                isLess = true;
            }

        }
        if (i >= startFrom + 10) {
            if (!isMore) {
                pageNo += "<li id=" + i + " onclick='more(" + skip1 + "," + limit + "," + i + ")' class='dotted'><a href='#''>...</a></li>"
                isMore = true;
            }

        } else if (i <= startFrom + 10) {
            pageNo += "<li id=" + i + " onclick='getExperiences(" + skip1 + "," + limit + "," + i + "," + startFrom + ")'><a href='javascript:;'>" + i + "</a></li>"

        }

        skip1 += limit;
    }
    if ((skip + limit) < count) {
        pageNo += "<li class='go-next' onclick='nextPage(" + limit + ")'><a href='javascript:;'><i class='fa fa-angle-right' aria-hidden='true'></i></a></li>";
    }
    return pageNo;

}
