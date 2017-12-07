var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');
var moment = require('moment');
var userModel = require('../models/user');
var experienceModel = require('../models/experience');
var _ = require('underscore');
var ObjectId = require('mongodb').ObjectID;

var profile = {

    default: function(req, res) {

        userModel.findOne({ userId: req.params.userId, status: "Active" }).exec(function(err, docs) {
            if (docs) {
                experienceModel.find({ userId: docs._id, submitted: true })
                    .exec(function(err, experience) {
                        if (err) {
                            console.log("--------- Error While Getting count of experience: ", err);
                        } else {

                            var count = experience.length;
                            var totalComments = 0;
                            _.each(experience, function(item) {
                                _.each(item.posts, function(postIndex) {
                                    // console.log("posts: ", postIndex.comments.length);
                                    totalComments = totalComments + postIndex.comments.length;

                                })

                            })

                            res.render('profile.html', { data: { title: 'Profile | Brand Label', page: 'profile', userDetails: req.session.userModel, city: req.session.userCity, docs: docs, count: count, totalComments: totalComments } });

                        }
                    });

            } else if (err) {
                res.redirect('/');

            }
        })

    },
    update: function(req, res) {
        if (!req.session.userModel) {
            res.status(500).json({ status: "error", message: "no login user found", docs: [] });
            return;
        }
        req.body.avatarImage = getAvatarImagePath(req.body.displayName);
        userModel.findByIdAndUpdate(req.session.userModel._id, req.body, { new: true },
            function(err, docs) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while updated docs", error: err });
                } else {
                    req.session.userModel.displayName = docs.displayName;
                    req.session.userModel.avatarImage = docs.avatarImage;
                    req.session.userModel.about = docs.about;
                    req.session.userModel.newUser = false;
                    //res.status(200).json({ status: "success", message: "docs updated successfully", docs: docs });
                    res.redirect('/profile/' + req.session.userModel.userId);
                }

            })
    },
    updateSettings: function(req, res) {
        if (!req.session.userModel) {
            res.status(500).json({ status: "error", message: "no login user found", docs: [] });
            return;
        }
        userModel.findOne({ _id: req.session.userModel._id }, function(err, docs) {
            if (err) {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            } else if (docs) {
                docs.notification = req.body.notification;
                docs.isSubscribed = req.body.isSubscribed;
                docs.anonymous = req.body.anonymous;
                docs.emailMeMyMessages = req.body.emailMeMyMessages;
                docs.save(function(err, doc) {
                    if (err) {
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    } else {
                        req.session.userModel = doc;
                        res.status(200).json({ status: "success", message: "Profile successfully", docs: docs })
                    }

                })
            } else {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            }
        });
    },
    loginDetails: function(req, res) {

        if (!req.session.userModel) {
            res.status(500).json({ status: "error", message: "no login user found", docs: [] });
            return;
        }
        userModel.findOne({ _id: req.session.userModel._id }, function(err, docs) {
            if (err) {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            } else if (docs) {
                console.log("docs::", docs);
                docs.displayName = req.body.displayNameInput;
                docs.anonymous = (req.body.anonymousInput ? req.body.anonymousInput : false);
                docs.avatarImage = getAvatarImagePath(req.body.displayNameInput);
                docs.save(function(err, doc) {
                    if (err) {
                        res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
                    } else {
                        req.session.userModel.anonymous = doc.anonymous;
                        req.session.userModel.avatarImage = doc.avatarImage;
                        req.session.userModel.displayName = doc.displayName;
                        req.session.userModel.newUser = false;
                        res.redirect('/');

                        /* req.session.userModel = doc;
                         res.redirect('/');*/


                        //res.status(200).json({ status: "success", message: "Profile successfully", docs: docs })
                    }

                })
            } else {
                res.render('page404.html', { data: { title: "404 Error", page: "404page" } });
            }
        });
    },
    getUserActivity: function(req, res) {
        //console.log(req.session.userModel)
        var userId = req.params.userId;
        req.query.filterBy = decodeURI(req.query.filterBy)
        var skip = req.query.skip ? parseInt(req.query.skip) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 10;
        var startFrom = req.query.startFrom ? parseInt(req.query.startFrom) : 1;
        experienceModel.aggregate([{ $unwind: "$posts" }, {
                    $unwind: {
                        "path": "$posts.comments",
                        "preserveNullAndEmptyArrays": true

                    }
                }, {
                    $unwind: {
                        "path": "$posts.likes",
                        "preserveNullAndEmptyArrays": true

                    }
                }, {
                    $unwind: {
                        "path": "$posts.comments.likes",
                        "preserveNullAndEmptyArrays": true

                    }
                }, {
                    $match: {
                        $or: [
                            { userId: ObjectId(userId), submitted: true },
                            { "posts.comments.userId": ObjectId(userId), submitted: true },
                            { "posts.likes.like": ObjectId(userId), submitted: true },
                            { "posts.comments.likes.like": ObjectId(userId), submitted: true },
                        ]
                    }
                },

                 {
                    $group: {
                        _id: "$_id",
                        posts: { $addToSet: { title: "$posts.title",postedOn:"$posts.postedOn",userId:  "$userId" } },
                        comments:{ $addToSet: { title: "$posts.comments.comment",postedOn:"$posts.comments.postedOn",userId:  "$posts.comments.userId"} },
                        postLike: { $addToSet: { like: "$posts.likes.like",postedOn:"$posts.likes.date",title:"$posts.title"} },
                        commentLike:{ $addToSet: { like: "$posts.comments.likes.like",postedOn:"$posts.comments.likes.date",title:"$posts.comments.comment"} },
                        experienceId: { $first: "$experienceId" },


                    }
                },
                {
                    $project: {
                        commentsLikes: {
                            $filter: {
                                input: "$commentLike",
                                as: "item",
                                cond: { $eq: ["$$item.like", ObjectId(userId)] }
                            }
                        },
                        postsLikes: {
                            $filter: {
                                input: "$postLike",
                                as: "item",
                                cond: { $eq: ["$$item.like", ObjectId(userId)] }
                            }
                        },
                        posts: {
                            $filter: {
                                input: "$posts",
                                as: "item",
                                cond: { $eq: ["$$item.userId", ObjectId(userId)] }
                            }
                        },
                        comments: {
                            $filter: {
                                input: "$comments",
                                as: "item",
                                cond: { $eq: ["$$item.userId", ObjectId(userId)] }
                            }
                        },

                        experienceId: "$experienceId"
                    }
                }

            ],
            function(err, documents) {
                // console.log("documents details****^^^^^^^^^^: ", documents);
                if (err) {
                    res.status(400).json({ status: "error", message: "Profile successfully", docs: "" })

                } else if (documents.length > 0) {
                    // console.log("in each function ^^^^^^^^^^^:", req.query.filterBy);

                    var data = []
                    _.each(documents, function(doc) {

                        if (req.query.filterBy != 'Responses' && req.query.filterBy != 'Like') {

                            _.each(doc.posts, function(post) {
                                data.push({ title: post.title, type: "post", postedOn: post.postedOn, experienceId: doc.experienceId });

                            })
                        }
                        if (req.query.filterBy != 'Experiences' && req.query.filterBy != 'Like') {
                            _.each(doc.comments, function(comment) {
                                data.push({ title: comment.title, type: "comment", postedOn: comment.postedOn, experienceId: doc.experienceId });

                            })
                        }
                        if (req.query.filterBy != 'Experiences' && req.query.filterBy != 'Responses') {
                            _.each(doc.commentsLikes, function(comment) {
                                data.push({ title: comment.title, type: "like", postedOn: comment.postedOn, experienceId: doc.experienceId });

                            })
                            _.each(doc.postsLikes, function(post) {
                                data.push({ title: post.title, type: "like", postedOn: post.postedOn, experienceId: doc.experienceId });

                            })
                        }

                    })

                    data = data.sort(function(a, b) { return new Date(a.postedOn) < new Date(b.postedOn) })


                    var mainData = JSON.parse(JSON.stringify(data));
                    res.status(200).json({ status: "success", message: "activity fetched....", html: getHtml(data.splice(skip, 10)), pagination: getPagination(mainData.length, 10, skip, startFrom) })
                    // res.status(200).json({ status: "success", message: "activity fetched....", html: mainData })


                } else {
                    res.status(200).json({ status: "success", message: "data not found", html: '<li><a href="javascript:;" class="activity-res-single clearfix"><span class="act-title">No such activity found ' + (req.query.filterBy != 'All' ? 'for ' + req.query.filterBy : '') + '</span><span class="act-published"></span></a></li>', pagination: '' })

                }
            })


    },

    trackProfileVisitCount: function(req, res) {
        console.log("-------- updating profile counts")
        if (req.params.user_id) {

            userModel.findOneAndUpdate({ _id: ObjectId(req.params.user_id) }, { $inc: { profileViews: 1 } }, function(err, doc) {
                console.log("----------- updating profile counts.")
                if (!err) {
                    console.log("----------- updating profile counts:: success:")
                    res.status(200).json({ status: "success", message: "User visit count recorded." });
                } else {
                    console.log("----------- updating profile counts:: Error:", err)
                    res.status(200).json({ status: "Error", message: "Error while recording user visit count." });
                }
            })
        } else {
            res.status(200).json({ status: "Error", message: "user id is not proper." });
        }
    }
}

module.exports = profile;

function getHtml(data) {
    var html = '';
    if (data.length == 0) {
        html += '<h5><center>No Data Found</center></h5>';
    }
    data.forEach(function(item) {
        //console.log("experience Id in html*****^^^^^^^^^^^^^^^^^^^: ", item);

        var Class = item.type == 'post' ? 'fa fa-pencil' : item.type == 'comment' ? 'fa fa-comments' : item.type == 'like' ? 'fa fa-thumbs-up' : '';
        html += '<li><a href="' + BASE_URL + 'experience-details/' + item.experienceId + '" class="activity-res-single clearfix"><span class="act-icon"><i class="' + Class + '" aria-hidden="true"></i></span><span class="act-title col-md-9">' + item.title + '</span><span class="act-published col-md-2">' + (item.postedOn && moment(item.postedOn).tz('Asia/Kolkata').format('llll') || '') + '</span></a></li>';
    })
    return html;
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
            pageNo += "<li id=" + i + " onclick='getUserActivity(" + skip1 + "," + limit + "," + i + "," + startFrom + ")'><a href='javascript:;'>" + i + "</a></li>"

        }

        skip1 += limit;
    }
    if ((skip + limit) < count) {
        pageNo += "<li class='go-next' onclick='nextPage(" + limit + ")'><a href='javascript:;'><i class='fa fa-angle-right' aria-hidden='true'></i></a></li>";
    }
    return pageNo;

}

function getAvatarImagePath(name) {
    return "img/anonymous_user/" + name.trim().charAt(0).toLowerCase() + ".png";
}