var config = require('../../config/config');
var businessHelper = require('../../helpers/businessHelper');
var experienceModel = require('../../models/experience');
var userModel = require('../../models/user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var experiences = {
    /*    getAll: function(req, res) {
            var start = 0;
            var end = 50;
            if (req.query.startLimit != null && req.query.startLimit != undefined && (parseInt(req.query.startLimit) > 0)) {
                start = parseInt(req.query.startLimit);
            }
            if (req.query.endLimit != null && req.query.endLimit != undefined && parseInt(req.query.endLimit) > 0) {
                end = parseInt(req.query.endLimit);
            }
            console.log("query data", req.query);
            experienceModel.find({}).sort('incidentDate')
                .skip(parseInt(req.query.startLimit))
                .limit(parseInt(req.query.endLimit))
                .populate('userId', 'name')
                .populate('posts.comments.userId', 'name')
                .exec(function(err, experience) {
                    if (!err && experience) {
                        res.status(200).json({ status: 'success', message: 'Experiences fetch successfully', docs: experience });
                    } else {
                        console.log("eeeerrrrr", err)
                        res.status(500).json({ status: 'error', message: 'error in feching Experiences', doc: '' });
                    }
                });
        },*/
    getAll: function(req, res) {
        var cond = {}
        // if (req.query.isShowFlagged) {
        //     cond ={"posts":{$elemMatch:{flagged:true}},$where:"this.posts.flagged.length>0"}
        // }
        // console.log("cond", cond)

        experienceModel.find(cond).sort('incidentDate')
            .populate('userId', 'name')
            .populate('posts.comments.userId', 'name')
            .exec(function(err, experience) {
                if (err) {
                    console.log("eeeerrrrr", err)
                    res.status(500).json({ status: 'error', message: 'error in feching Experiences', doc: err });
                } else {
                    console.log("experience", experience.length)
                    res.status(200).json({ status: 'success', message: 'Experiences fetch successfully', docs: experience });
                }
            });
    },
    getOne: function(req, res) {
        experienceModel.findById(req.params.experienceId)
             .populate('userId').populate('storeId')
            //.populate({ path: 'userId', select: ['name', 'status'] })
            .populate('vehicle.carModelId')
            // .populate({ path: 'vehicle.carModelId', match: { "variants.variantId": 'vehicle.variantId' },select:['model','name'] })
            .populate({ path: 'posts.comments.userId', select: ['name', 'status'] })
            .exec(function(err, experience) {
                if (!err && experience) {
                    console.log("data", experience)
                    res.status(200).json({ status: 'success', message: 'Experience fetch successfully', doc: experience });
                } else {
                    console.log("err", err);
                    res.status(500).json({ status: 'error', message: 'error in feching experience', doc: '' });
                }
            });
    },
    removePost: function(req, res) {
        console.log("post Id:", req.params);
        console.log("experience Id:", req.params);

        if (req.params.postId != null && req.params.postId != undefined) {
            experienceModel.findOneAndUpdate({ "_id": ObjectId(req.params.expId), "posts._id": ObjectId(req.params.postId) }, { $pull: { "posts": { _id: ObjectId(req.params.postId) } } }, { new: true },
                function(err, result) {
                    if (err) {
                        console.log("error", err);
                        res.status(500).json({ status: "error", message: "Error while Removing Post", error: err });
                    } else {
                        console.log("-------------------------- remove post result: ", result)
                        if (result && result.storeId) {

                            businessHelper.updateInfolatics(result.storeId);
                        }
                        res.status(200).json({ status: "success", message: "Post Removed successfully", docs: result });
                    }
                })
        } else {
            res.status(500).json({ status: "error", message: "Error while Removing Post", docs: '' });
        }
    },
    removeComment: function(req, res) {
        if (req.body.postId != null && req.body.postId != undefined && req.body.commentId != null && req.body.commentId != undefined) {
            experienceModel.findOneAndUpdate({ "_id": ObjectId(req.params.expId), "posts._id": ObjectId(req.body.postId) }, { $pull: { "posts.$.comments": { _id: ObjectId(req.body.commentId) } } }, { new: true },
                function(err, result) {
                    if (err) {
                        console.log("error", err);
                        res.status(500).json({ status: "error", message: "Error while Removing Comment", error: err });
                    } else {
                        console.log("data", result)
                        res.status(200).json({ status: "success", message: "Comment Removed successfully", docs: result });
                    }
                })
        } else {
            res.status(500).json({ status: "error", message: "Error while Removing Comment", error: err });
        }
    },
    bannUser: function(req, res) {
        if (req.params.userId != null && req.params.userId != undefined) {
            userModel.findByIdAndUpdate(req.params.userId, { $set: { status: "Banned" } }, { new: true },
                function(err, user) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while Bann User", error: err });
                    } else {
                        res.status(200).json({ status: "success", message: "User Banned successfully", docs: user });
                    }
                })
        } else {
            res.status(500).json({ status: "error", message: "User Id not found", error: err });
        }
    },
    isFeatured: function(req, res) {
        if (req.body.status != null && req.body.status != undefined) {
            experienceModel.findByIdAndUpdate(req.params.expId, { $set: { featured: req.body.status } }, { new: true },
                function(err, exp) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while Updating Feature", error: err });
                    } else {
                        res.status(200).json({ status: "success", message: "isFeatured updated successfully", docs: exp });
                    }

                })
        } else {
            res.status(500).json({ status: "error", message: "Error while Updating Feature", error: err });
        }
    },

    //To add temp comments//
    comment: function(req, res) {
        experienceModel.findById(req.params.expId, function(err, exp) {
            if (!err && exp) {
                exp.posts[1].comments.push(req.body);
                // exp.posts.push({ "title": req.body.comment });
                exp.save(function(err, docs) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while Bann User", error: err });
                    } else {
                        res.status(200).json({ status: "success", message: "User Banned successfully", docs: docs });
                    }
                })
            }
        })
    },
    //To add temp posts
    post: function(req, res) {
        experienceModel.findById(req.params.expId, function(err, exp) {
            if (!err && exp) {
                exp.posts.push(req.body);
                exp.save(function(err, docs) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while Bann User", error: err });
                    } else {
                        res.status(200).json({ status: "success", message: "User Banned successfully", docs: docs });
                    }
                })
            }
        })
    },
    searchexperience: function(req, res) {
        console.log("searchexperience req.query---");

        console.log("------ query: ", req.query);
        experienceModel.find({ posts: { $elemMatch: { title: new RegExp(req.query.search, "i") } }, submitted: true })
            .populate({
                path: 'storeId',
                match: {
                    cityId: ObjectId(req.query.cityId)
                }
            })
            .exec(function(err, experiences) {
                if (err) {
                    console.log("in err")
                    res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
                } else {
                    console.log("in success:", experiences);

                    res.status(200).json({ status: 'success', message: "experiences fetched successfully.", docs: experiences });
                }
            })
    },
    deleteExperience: function(req, res) {

        console.log("in delete experience req: ", req.params);

        experienceModel.remove({
                _id: req.params.experienceId
            },
            function(err, doc) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while deleting experience", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "Experience deleted successfully", doc: doc });
                }

            })


    }
};

module.exports = experiences;