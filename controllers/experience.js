var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');
var cityModel = require('../models/city');
var storeModel = require('../models/store');
var formModel = require('../models/form');
var carModel = require('../models/carModel');
var experienceModel = require('../models/experience');
var ObjectId = require('mongodb').ObjectID;
var _ = require('underscore');
var moment = require('moment-timezone');


var experience = {
    step1: function(req, res) {
        businessHelper.getCities(function(err, cities) {
            if (err) {
                console.log("#### Get Cities Error", err)
            } else {
                businessHelper.getStores(function(err, stores) {
                    if (err) {
                        console.log("#### Get stores Error", err)
                    } else {
                        res.render('create-experience-step1.html', { data: { title: 'Create Experience', cities: cities, stores: stores, userDetails: req.session.userModel, city: req.session.userCity } });
                    }
                })
            }

        })

    },

    step2: function(req, res) {
        storeModel.findOne({ storeId: req.params.id, status: { $in: ["Active", "Approved"] } }).exec(function(err, store) {
            if (err) {
                console.log("#### Get stores Error", err)
            } else {
                // console.log("store data: ", store);
                // console.log("\n store Id: ", store._id);
                businessHelper.getVotes(store._id, function(count) {
                    res.render('create-experience-step2.html', { data: { title: 'Create Experience', store: store, count: count, userDetails: req.session.userModel, city: req.session.userCity } });

                })
            }

        })


    },
    save: function(req, res) {

        var expModel = {};
        expModel.storeId = req.body.makeId;
        expModel.userId = req.session.userModel._id;
        expModel.incidentDate = req.body.postedOn;
        //posts
        expModel.posts = {};
        expModel.posts.postedOn = new Date();
        expModel.posts.incidentDate = req.body.postedOn;
        expModel.posts.rating = req.body.rating;
        expModel.posts.title = req.body.title;
        expModel.posts.description = req.body.description;
        //form 
        expModel.formSnapshots = [];
        expModel.formSnapshots[0] = { formId: req.body.exp_type };
        //vehicle
        expModel.vehicle = {};
        expModel.vehicle.carModelId = req.body.car_model;
        expModel.vehicle.variantId = req.body.car_variant;
        expModel.vehicle.vin = req.body.vin;
        expModel.vehicle.year = req.body.year;

        experienceModel.create(expModel, function(err, experience) {
            if (err) {
                console.log("#### Get stores Error", err)
            } else {

                formModel.findOne({ _id: experience.formSnapshots[0].formId }).populate('experience.formSnapshots[0].formId').exec(function(err, docs) {
                    if (docs) {
                        res.status(200).json({ status: "success", message: "Submitted successfully", experience: experience, docs: docs })
                        //res.render('create-experience-step3.html', { data: { title: 'Create Experience', experience: experience, docs: docs, groups: groups, attached_questions: attached_questions } });

                    } else if (err) {
                        // Render 404 state
                        res.status(500).json({ status: 'error', message: 'Failed', docs: err });
                    }
                })



            }

        })


    },
    step3: function(req, res) {
        console.log("request body:", req.body);
        console.log("request params:", req.params);

        experienceModel.findOne({ experienceId: req.params.experienceId }).exec(function(err, experience) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Failed', docs: err });
            } else if (experience) {

                formModel.findOne({ _id: experience.formSnapshots[0].formId })
                    .populate('questionGroups.questions.questionId')
                    .populate('questions.questionId')
                    .exec(function(err, docs) {
                        if (docs) {
                            var groups = docs.questionGroups;
                            groups = _.sortBy(groups, 'sequenceNo');
                            var attached_questions = docs.questions;
                            attached_questions = _.sortBy(attached_questions, 'sequenceNo');
                            //res.status(200).json({ status: "success", message: "Submitted successfully", experience: experience, docs: docs, groups: groups, attached_questions: attached_questions })
                            res.render('create-experience-step3.html', { data: { title: 'Create Experience', docs: docs, groups: groups, attached_questions: attached_questions, experience: experience, userDetails: req.session.userModel, city: req.session.userCity } });

                        } else if (err) {
                            // Render 404 state
                            res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                        } else {
                            // Render 404 state
                            res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                        }
                    })
            } else {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            }

        })






    },
    create: function(req, res) {
        console.log("request body: ", req.body);
        experienceModel.findOne({ "experienceId": req.body.experienceId }).populate('storeId').exec(function(err, docs) {
            if (err) {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            } else if (docs) {
                docs.formSnapshots[0].questions = req.body.questions;
                docs.isRecommended = req.body.isRecommended;
                docs.bestThing = req.body.bestThing;
                docs.worstThing = req.body.worstThing;
                docs.submitted = true;
                docs.save(function(err, doc) {
                    if (err) {
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    } else {
                        businessHelper.updateInfolatics(docs.storeId);
                        setTimeout(function() {
                            res.status(200).json({ status: "success", message: "Submitted successfully", doc: doc });
                        }, 2000);
                    }

                })
            } else {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            }
        });
    },

    details: function(req, res) {
        console.log("req params: ", req.query.experience);
        experienceModel.findOne({ experienceId: parseInt(req.query.experience) })
            // .populate('storeId')
            // .deepPopulate('storeId.makeId')
            .populate({ path: 'storeId', populate: { path: 'makeId' } })
            .populate('posts.comments.userId')
            .populate('userId')
            .populate({
                path: 'formSnapshots.formId',
                populate: {
                    path: 'questionGroups.questions.questionId'
                }
            })
            .populate({
                path: 'formSnapshots.formId',
                populate: {
                    path: 'questionGroups.type'
                }
            })
            .populate({
                path: 'formSnapshots.formId',
                populate: {
                    path: 'questions.questionId'
                }
            })
            .exec(function(err, docs) {
                console.log("----------------- Experience: ", docs)

                if (err || !docs || !docs.storeId) {
                    console.log("experience details---------------:error ", err, docs);
                    res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                } else {

                    docs = JSON.parse(JSON.stringify(docs))
                    var closeQustionData = [];
                    docs.formSnapshots[docs.formSnapshots.length - 1].formId.questionGroups.forEach(function(item) {
                        item.questions.forEach(function(subItem) {
                            var data = _.find((docs.formSnapshots[docs.formSnapshots.length - 1].questions), function(object) {
                                if (object.groupId === item._id + "" && object.questionId + "" === subItem.questionId._id + "") {
                                    subItem.questionId["value"] = object.value;
                                    closeQustionData.push({ "groupId": item._id, "questionId": subItem.questionId._id, "value": object.value, "type": subItem.questionId.type })
                                    return object;
                                }
                            })
                        })
                    })
                    docs.formSnapshots[docs.formSnapshots.length - 1].formId.questions.forEach(function(item) {
                        var data = _.find((docs.formSnapshots[docs.formSnapshots.length - 1].questions), function(object) {
                            if (object.groupId == "0" && object.questionId + "" === item.questionId._id + "") {
                                item.questionId["value"] = object.value;
                                closeQustionData.push({ "groupId": 0, "questionId": item.questionId._id, "value": object.value, "type": item.questionId.type })
                                return object;
                            }
                        })
                    })

                    docs["closeStoryQuestions"] = closeQustionData;

                    storeModel.aggregate([{
                            $match: {
                                "_id": docs.storeId._id
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
                            businessHelper.getVotes(docs.storeId._id, function(count) {
                                // console.log("vote ", count);
                                // console.log("****experience ", docs.posts[0].title);

                                var title = docs.posts[0].title + ' | Brand Label';
                                docs = (JSON.parse(JSON.stringify(docs)))
                                docs.posts[0].vanityUrl = changeToVanityurl(docs.posts[0].title)
                                data = {
                                    page: 'experience-details',
                                    title: title,
                                    experience: docs,
                                    workingHours: workingHours,
                                    userDetails: req.session.userModel,
                                    count: count,
                                    city: req.session.userCity
                                }
                                console.log(" exp1111  data", data);
                                //visited Count on experience details page
                                if ((req.session.userModel != undefined) && (req.session.userModel._id != (docs.userId && docs.userId._id))) {
                                    res.render('experience-details.html', { data: data });

                                } else {
                                    res.render('experience-details.html', { data: data });
                                }


                            });
                        }
                    })

                }
            })
    },
    getForms: function(req, res) {
        console.log("request body^^^^^^^^^^^^^", req.query);
        formModel.find({ status: 'Active', type: new RegExp(req.query.type, "i") }, function(err, forms) {
            if (err) {
                res.status(500).json({ status: "error", message: "Errors while getting stores" })
            } else {
                res.status(200).json({ status: "success", message: "Stores gets", docs: forms })
            }

        })
    },

    getCarModel: function(req, res) {
        carModel.find({}, function(err, models) {
            if (err) {
                res.status(500).json({ status: "error", message: "Errors while getting stores" })
            } else {
                res.status(200).json({ status: "success", message: "Stores gets", docs: models })
            }

        })
    },

    LikeOrFlag: function(req, res) {
        var query = {};
        var setData = {};
        var value = {};
        var key;
        if (req.body.type != null && req.body.type != undefined) {

            value = req.body.action == 'likes' ? { "like": req.body.userId } : req.body.userId;

            if (req.body.type === "Post") {

                query = { _id: req.params.expId, "posts._id": req.body.postId };

                key = req.body.action == 'likes' ? "posts.likes.like" : "posts." + req.body.action;

                findRecord(req, res, 'Post', key, function(result) {

                    key = "posts.$." + req.body.action;

                    if (result == true) {
                        removeRecord(query, key, req, res);
                    } else {
                        console.log("record not found *********", key)
                        setData = {
                            $addToSet: {
                                [key]: value
                            }
                        };
                        updateRecord(query, setData, req, res, true, true);
                    }
                })
            } else if (req.body.type === "Comment") {

                query = { _id: req.params.expId, "posts._id": req.body.postId, "posts.comments._id": req.body.commentId };
                key = req.body.action == 'likes' ? "posts.comments.likes.like" : "posts.comments" + req.body.action;

                findRecord(req, res, 'Comment', key, function(result) {
                    if (result == true) {
                        console.log("record found");
                        getRecordPosition(query, req, res, function(result) {
                            key = "posts." + result.postIndex + ".comments." + result.commentIndex + "." + req.body.action;
                            removeRecord(query, key, req, res);
                        });
                    } else {
                        getRecordPosition(query, req, res, function(result) {
                            key = "posts." + result.postIndex + ".comments." + result.commentIndex + "." + req.body.action;
                            setData = {
                                $addToSet: {
                                    [key]: value
                                }
                            };
                            updateRecord(query, setData, req, res, true, true, result);
                        })
                    }
                })

            }
        }
    },
    saveComment: function(req, res) {
        if (req.body.comment != null && req.body.comment != undefined) {
            var commentData = { "postedOn": new Date(), "userId": req.body.userId, "comment": req.body.comment };
            experienceModel.findOneAndUpdate({ _id: req.params.expId, "posts._id": req.body.postId }, { $addToSet: { "posts.$.comments": commentData } }, { new: true })
                .populate('storeId')
                .populate('userId')
                .exec(function(err, commentDoc) {
                    if (err) {
                        console.log("err", err)
                        res.status(500).json({ status: "error", message: "Errors while Adding Comment" })
                    } else {
                        if (commentDoc != null && commentDoc != "") {
                            //Send email notification to post author
                            sendNotification(req, commentDoc, 'commented on', 'post', commentDoc.posts[0].title)

                            businessHelper.updateExperienceWeight(ObjectId(req.params.expId)) ///
                            setTimeout(function() {
                                res.status(200).json({ status: "success", message: "Comment Added successfully", docs: commentDoc });
                            }, 2000)
                        }
                    }
                })
        } else {
            res.status(500).json({ status: "error", message: "Errors in Comment Data" })
        }
    },

    addPost: function(req, res) {
        console.log("inside add post", req.body.postData)
        if (req.body.postData != null && req.body.postData != undefined) {
            experienceModel.findOneAndUpdate({ _id: req.params.expId }, { $addToSet: { "posts": req.body.postData } }, { new: true }, function(err, postDoc) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Errors while Adding Post" })
                } else {

                    businessHelper.updateInfolatics(req.body.storeId);
                    setTimeout(function() {
                        res.status(200).json({ status: "success", message: "Post Added successfully", docs: postDoc });
                    }, 2000);
                }
            })
        }
    },

    updateCommentAndPost: function(req, res) {
        var query = {};
        var key;
        var setData;
        console.log("\n ~~~~~~~~~~~~~ updateCommentAndPost", req.body);
        if (req.body.comment != null && req.body.comment != undefined) {
            if (req.body.type == "Post") {
                query = { _id: req.params.expId, "posts._id": req.body.postId };
                setData = {
                    $set: {
                        "posts.$.rating": req.body.comment.rating,
                        "posts.$.title": req.body.comment.title,
                        "posts.$.description": req.body.comment.description,
                        "posts.$.incidentDate": req.body.comment.incidentDate
                    }
                };
                console.log("set data", setData)
                updateRecord(query, setData, req, res);
            } else if (req.body.type == "Comment") {
                query = { _id: req.params.expId, "posts._id": req.body.postId, "posts.comments._id": req.body.commentId }
                getRecordPosition(query, req, res, function(result) {
                    key = "posts." + result.postIndex + ".comments." + result.commentIndex + ".comment";
                    setData = {
                        $set: {
                            [key]: req.body.comment.comment
                        }
                    };
                    updateRecord(query, setData, req, res, true);
                });
            }
        } else {
            res.status(500).json({ status: "error", message: "Errors in Comment Data" })
        }
    },

    closeSotry: function(req, res) {
        console.log("inside closeSotry!!!!!!!!!!!!!!!!!!!!!", req.body.questions)
        experienceModel.findOneAndUpdate({ _id: ObjectId(req.params.expId) }, {
            "$set": {
                "isRecommended": req.body.isRecommended,
                "closedDate": new Date(),
                "closingNotes": req.body.closingNotes,
                "closed": true
            },
            "$push": {
                "formSnapshots": {
                    "postedOn": new Date(),
                    "formId": req.body.formId,
                    "questions": req.body.questions,
                    "isInitial": false
                }
            }
        }, { new: true }, function(err, expData) {
            if (err) {
                console.log("error", err)
                res.status(500).json({ status: "error", message: "Errors while updating record" })
            } else {
                businessHelper.updateInfolatics(req.body.storeId);

                setTimeout(function() {
                    res.status(200).json({ status: "success", message: "Updated successfully", docs: expData })
                }, 2000);
            }

        })
    },

    trackExperienceVisitCount: function(req, res) {
        if (req.params.experienceId && req.params.userId) {

            experienceModel.findOneAndUpdate({ _id: ObjectId(req.params.experienceId) }, { $addToSet: { visitedCount: req.params.userId } }, function(err, doc) {
                if (!err) {
                    res.status(200).json({ status: "success", message: "User visit count recorded." });
                } else {
                    businessHelper.updateExperienceWeight(ObjectId(req.params.experienceId))
                    setTimeout(function() {
                        res.status(200).json({ status: "Error", message: "Error while recording user visit count." });
                    }, 2000)
                }
            })
        }
    }
}

function findRecord(req, res, type, key, callback) {

    if (type == "Post") {
        experienceModel.aggregate([{ $unwind: "$posts" }, { $unwind: "$posts." + req.body.action },
            {
                $match: {
                    _id: ObjectId(req.params.expId),
                    "posts._id": ObjectId(req.body.postId),
                    [key]: ObjectId(req.body.userId)
                }
            }
        ], function(err, data) {
            if (data != null && data != '') {
                callback(true);
            } else {
                callback(false);
            }
        })
    } else if (type == "Comment") {
        experienceModel.aggregate([{ $unwind: "$posts" }, { $unwind: "$posts.comments" }, { $unwind: "$posts.comments." + req.body.action },
            {
                $match: {
                    _id: ObjectId(req.params.expId),
                    "posts._id": ObjectId(req.body.postId),
                    "posts.comments._id": ObjectId(req.body.commentId),
                    [key]: ObjectId(req.body.userId)
                }
            }
        ], function(err, data) {
            if (data != null && data != '') {
                callback(true);
            } else {
                callback(false);
            }
        })
    }

}

function getRecordPosition(query, req, res, callback) {
    experienceModel.findOne(query, function(err, data) {
        if (err) {
            console.log("err", err)
            res.status(500).json({ status: "error", message: "Errors while making flagged" })
        } else {
            if (data) {
                data.posts.forEach(function(item, index) {

                    if (item._id == req.body.postId) {
                        item.comments.forEach(function(subItem, subIndex) {

                            if (subItem._id == req.body.commentId) {
                                callback({ postIndex: index, commentIndex: subIndex });
                            }
                        })
                    }
                })
            }
        }

    })
}

function updateRecord(query, setData, req, res, isLike, notify, position) {
    if (isLike === undefined) {
        isLike = false;
    }

    console.log("inside updateRecord...")
    experienceModel.findOneAndUpdate(query, setData, { new: true })
        .populate('storeId')
        .populate('userId')
        .exec(function(err, expData) {
            if (err) {
                console.log("err", err)
                res.status(500).json({ status: "error", message: "Errors while updating record" })
            } else {
                if (expData != null && expData != "") {
                    getLikes(expData, req, function(result) {

                        if (isLike === false) {
                            console.log("_____________________________infolatics called", req.body.storeId)
                            businessHelper.updateInfolatics(req.body.storeId);
                            // setTimeout(function() {
                            res.status(200).json({ status: "success", message: "Updated successfully", docs: expData, "action": "active", "likes": result.likes })
                            // }, 2000);
                        } else {

                            //Action data for notification
                            if (position) {
                                var title = req.body.type == 'Comment' ? expData.posts[position.postIndex].comments[position.commentIndex].comment : expData.posts[0].title;
                            }
                            if (notify) {
                                var action = req.body.action == 'likes' ? 'Like' : 'Flag';
                                sendNotification(req, expData, action, req.body.type, title);
                            }


                            businessHelper.updateExperienceWeight(ObjectId(req.params.expId))
                            res.status(200).json({ status: "success", message: "Updated successfully", docs: expData, "action": "active", "likes": result.likes })


                        }
                    })
                }

            }

        })
}

function removeRecord(query, key, req, res) {
    console.log("key Data************", key)
    value = req.body.action == 'likes' ? { "like": ObjectId(req.body.userId) } : ObjectId(req.body.userId);

    experienceModel.findOneAndUpdate(query, {
            $pull: {
                [key]: value
            }
        }, { new: true },
        function(err, expData) {
            if (err) {
                console.log("error", err);
                res.status(500).json({ status: "error", message: "Error while Deactive", error: err });
            } else {
                if (expData != null && expData != "") {
                    getLikes(expData, req, function(result) {
                        res.status(200).json({ status: "success", message: "Deactivated successfully", docs: result, "action": "deActive", "likes": result.likes });
                    })
                }

            }
        })
}

function getLikes(data, req, callback) {
    var postIndex;
    var commentIndex;
    var likeData = {};
    data.posts.forEach(function(item, index) {
        if (item._id == req.body.postId) {
            postIndex = index;
            item.comments.forEach(function(subItem, subIndex) {
                if (subItem._id == req.body.commentId) {
                    commentIndex = subIndex;
                }
            })
        }
    })
    if (commentIndex >= 0) {
        likeData = data.posts[postIndex].comments[commentIndex].likes;
    } else {
        likeData = data.posts[postIndex].likes;
    }
    callback({ "likes": likeData });
}

function sendNotification(req, expData, action, type, title) {
    var notificationData = {};
    notificationData.authName = expData.userId.name;
    notificationData.authEmail = expData.userId.email;
    notificationData.userName = req.session.userModel.name;
    notificationData.subject = "Notification on your " + type;
    notificationData.action = action;
    notificationData.event = type;
    notificationData.postLink = req.session.userCity && req.session.userCity.name + '/' + (expData && changeToVanityurl(expData.storeId.name)) + '/experiences/' + (expData && expData.posts && expData.posts.length > 0 && changeToVanityurl(expData.posts[0].title)) + '?experience=' + (expData && expData.experienceId);
    notificationData.post = title;
    businessHelper.experienceNotification(notificationData, function(result) {})
}

/*function visitedCount(expId, userId, callback) {
    experienceModel.findOneAndUpdate({ _id: ObjectId(expId) }, { $addToSet: { visitedCount: userId } }, function(err, doc) {
        callback(true);
    })
}*/


module.exports = experience;