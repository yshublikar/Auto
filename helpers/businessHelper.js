var cityModel = require('../models/city');
var storeModel = require('../models/store');
var experienceModel = require('../models/experience');
var _ = require('underscore');
var async = require('async')
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var envConfig = require('../models/config');
var notificationHelper = require('../helpers/emailHelper');
var config = require('../config/config.js');
var handlebars = require('handlebars');
var fs = require("fs");

var businessHelper = {};

businessHelper = {
    getCities: function(callback) {
        cityModel.find({}, { _id: 1, name: 1, state: 1 }).limit(3).exec(function(err, cities) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, cities);
            }

        })
    },
    getStores: function(callback) {
        storeModel.find({ status: { $in: ["Active", "Approved"] } }, { _id: 1, name: 1, type: 1, logo: 1, address: 1 }).limit(3).exec(function(err, stores) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, stores);
            }

        })
    },
    updateInfolatics: function(storeId) {
        experienceModel.find({ storeId: storeId, submitted: true })
            .populate({
                path: 'formSnapshots.formId',
                populate: {
                    path: 'questionGroups.questions.questionId'
                }
            })
            .exec(function(err, exps) {
                if (err) {
                    console.log("##### Error while getting experiences");
                } else if (exps.length > 0) {

                    ///************* Recommended infolatics starts ****************////
                    var recommendedScore = ((_.filter(exps, { isRecommended: true }).length * 100 / exps.length));


                    var allPosts;
                    _.each(exps, function(exp) {
                        allPosts = _.union(allPosts, exp.posts);
                    })

                    var totalRating = 0;
                    _.each(allPosts, function(post) {
                        totalRating += post.rating;
                    })
                    var overallRating = ((totalRating / (allPosts.length)));

                    storeModel.findOneAndUpdate({ _id: storeId }, { $set: { overallRating: overallRating, recommendedScore: recommendedScore } }, { new: true }, function(err, store) {
                        if (err) {
                            console.log("##### Error whiles save store::::: ");
                        } else if (store) {
                            console.log("##### Updated Successfully store", store.name);
                        } else {
                            console.log("##### Store not Found ");
                        }

                    })


                    ///************* Recommended infolatics ends ****************////
                    ///************* Question Group infolatics starts ****************////

                    var i = 0;
                    async.eachSeries(exps, function(exp, next) {
                        _.each(exp.formSnapshots, function(formSnap) {
                            formSnap.questionGroupData = [];
                            _.each(formSnap.formId.questionGroups, function(group) {
                                // var groupAvg = 0;
                                var totalMaxQuesValue = 0;
                                var totalAnsQuesValue = 0;
                                _.each(group.questions, function(question) {
                                    _.each(formSnap.questions, function(frmQuestion) {
                                        if (frmQuestion.questionId + "" === question.questionId._id + "") {
                                            var maxQuestionValue = _.max(question.questionId.options, function(option) { return option.value; });
                                            // groupAvg += (frmQuestion.value * 100 / maxQuestionValue.value);
                                            totalMaxQuesValue += maxQuestionValue.value;
                                            totalAnsQuesValue += frmQuestion.value
                                        }
                                    });
                                });
                                console.log("##### ", group.type, totalAnsQuesValue, totalMaxQuesValue, ((totalAnsQuesValue * 100 / totalMaxQuesValue)))
                                formSnap.questionGroupData.push({ groupType: group.type, value: totalMaxQuesValue > 0 ? (totalAnsQuesValue * 100 / totalMaxQuesValue) : 0 });

                            });
                        })

                        exp.save(function(err, doc) {
                            i++;
                            if (err) {
                                console.log("##### Error whiles save experince::::: ", err);
                                next(exp[i])
                            } else {
                                console.log("##### Updated Successfully", i);
                                next(exp[i]);
                            }

                        })
                    })

                    ///************* Question Group infolatics end ****************////

                } else {
                    console.log("##### experiences not found for store::::: ", storeId);

                }
            })

    },
    getVotes: function(storeId, callback) {
        console.log("-------------- storeId: ", storeId);
        experienceModel.count({ storeId: ObjectId(storeId), submitted: true })
            .exec(function(err, count) {
                if (err) {
                    console.log("--------- Error While Getting count of votes: ", err);
                    callback(0)
                    //res.render('store-details.html', { data: { page: 'store-details', store: docs } });
                } else {
                    callback(count);
                }
            });
    },
    updateExperienceWeight: function(experienceId) {
        experienceModel.findById(experienceId)
            .exec(function(err, exps) {
                if (err) {
                    console.log("##### Error while getting experiences", err);
                } else if (exps) {
                    envConfig.find({ key: { $in: ["expLikesWeightage", "expCommentsWeightage", "expVisitsWeightage"] } }, function(err, keys) {
                        if (err) {
                            console.log("err in find weightage key", err)
                        } else if (keys.length > 0) {
                            var expTotalWeightage = 0

                            _.each(exps.posts, function(post) {

                                ///calculate like weightage
                                var likeWeightageKey = _.findWhere(keys, { key: "expLikesWeightage" });
                                var likeWeightage = 0;
                                if (likeWeightageKey) {
                                    likeWeightage = parseInt(likeWeightageKey.value);
                                }
                                expTotalWeightage += post.likes.length * likeWeightage;

                                ///calculate comments weightage
                                var expCommentsWeightageKey = _.findWhere(keys, { key: "expCommentsWeightage" })
                                var expCommentsWeightage = 0;
                                if (expCommentsWeightageKey) {
                                    expCommentsWeightage = parseInt(expCommentsWeightageKey.value);
                                }
                                expTotalWeightage += post.comments.length * expCommentsWeightage;

                            })
                            ///calculate visited weightage
                            var expVisitsWeightageKey = _.findWhere(keys, { key: "expVisitsWeightage" })
                            var expVisitsWeightage = 0;
                            if (expVisitsWeightageKey) {
                                expVisitsWeightage = parseInt(expVisitsWeightageKey.value);
                            }
                            expTotalWeightage += exps.visitedCount.length * expVisitsWeightage;
                            exps.weight = expTotalWeightage;
                            exps.save();

                        } else {
                            console.log("Keys for weightage not found")

                        }
                    })

                } else {
                    console.log("##### experiences not found");

                }
            })

    },
    changeToVanityurl: function(input) {
        return (input).toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-")
    },

    experienceNotification: function(details, callback) {
        var headers = {};
        var templateVars = {};
        headers.to = details.authEmail;
        headers.from = config.headers.from;
        headers.subject = details.subject;

        details.postLink = BASE_URL + details.postLink;
        details['url'] = BASE_URL;
        details['logo'] = BASE_URL + "/img/logo.png"


        var source = "./views/templates/experienceNotification.html";
        
        fs.readFile(source, 'utf8', function(err, data) {
            var template = handlebars.compile(data);
            var result = template(details);
            templateVars.emailMessage = result;
            notificationHelper.sendEmail(headers, templateVars, function(email) {
                callback(true)
            });
        });
    }

}


module.exports = businessHelper;