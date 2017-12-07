var config = require('../../config/config');
var secret = require('../../config/secret');
var fs = require("fs");
var storeModel = require('../../models/store');
var encryptor = require('simple-encryptor')(secret());
var async = require('async')
var mkdirp = require('mkdirp');
var stores = {};
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var sizeOf = require('image-size');
stores.addStore = function(req, res) {
    var data = JSON.parse(req.body.storeModel);


    async.waterfall([
        function(callback) {
            storeModel.findOne({ name: data.name }, function(err, doc) {
                if (err) {
                    callback("Error while findOne store" + err, undefined);
                } else if (doc) {
                    callback("Store Allready exist.", undefined);
                } else {
                    callback();
                }
            });

        },
        function(callback) {

            fileUpload(req, function(err, result) {
                if (err) {
                    callback('Error while uploading file, ' + err, undefined)
                } else {
                    callback(undefined, result)
                }
            })

        },
        function(result, callback) {

            result.location = { coordinates: [parseFloat(result.lattitude), parseFloat(result.longitude)] };
            storeModel.create(result, function(err, doc) {
                if (err) {
                    console.log(err);
                    callback("Error while creating store." + err, undefined);
                } else {
                    callback(undefined, doc);
                }

            })

        }
    ], function(err, result) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error", error: err });
        } else {
            res.status(200).json({ status: "success", message: "Stores created successfully", doc: result });
        }
    })
};
stores.updateStore = function(req, res) {

    async.waterfall([
            function(callback) {
                fileUpload(req, function(err, result) {
                    if (err) {
                        if (err == "Please upload Image dimension 217 X 115") {
                            callback('Error while uploading file, ' + err, undefined)

                        } else {
                            callback(undefined, result)
                        }


                        //
                    } else {
                        callback(undefined, result)
                    }
                })

            },
            function(result, callback) {
                if (!result) {
                    result = JSON.parse(req.body.storeModel)
                }
                if (!result.location) {
                    result.location = { type: "Point" };
                }
                result.location.coordinates = [parseFloat(result.lattitude || 0), parseFloat(result.longitude || 0)]

                storeModel.findByIdAndUpdate(req.params.storeId, result, { new: true },
                    function(err, doc) {
                        if (err) {
                            callback("Error while creating store " + err, undefined);
                        } else {
                            callback(undefined, doc);
                        }
                    })
            }

        ],
        function(err, result) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating store", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Stores created successfully", doc: result });
            }
        })



};
stores.deleteStore = function(req, res) {

    storeModel.remove({
            _id: req.params.storeId
        },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating store", error: err });
            } else {
                res.status(200).json({ status: "success", message: "store created successfully", doc: doc });
            }

        })
};
stores.getOneStore = function(req, res) {
    storeModel.findById(req.params.storeId,
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating store", error: err });
            } else {
                res.status(200).json({ status: "success", message: "store created successfully", doc: doc });
            }

        })
};
stores.getAlltSores = function(req, res) {
    storeModel.find().populate('makeId').exec(function(err, docs) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating store", error: err });
        } else {
            res.status(200).json({ status: "success", message: "store created successfully", docs: docs });
        }

    })
};


stores.searchStore = function(req, res) {
    console.log("req.query---");
    console.log(req.query);
    storeModel.find({ cityId: ObjectId(req.query.cityId), name: new RegExp(req.query.search,"i") }).exec(function(err, stores) {
        if (err) {
            res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
        } else {
            res.status(200).json({ status: 'success', message: "stores fetched successfully.", docs: stores });
        }
    })
};


module.exports = stores;

function fileUpload(req, callback) {
    if (req.file) {
        var dimensions = sizeOf(req.file.path);       
        var result = JSON.parse(req.body.storeModel);
        var fileExtension = '.' + req.file.originalname.split('.').pop();
        var uploadFIleName = result.name + "_" + new Date().getTime() + fileExtension;
        var folder = "./uploads/storelogo/";
        /*if (dimensions.width == 217 && dimensions.height == 115) {*/


            mkdirp(folder, function(err, success) {
                fs.readFile(req.file.path, function(err, data) {
                    fs.writeFile(folder + uploadFIleName, data, function(err) {
                        if (err) {
                            callback("File not uploaded successfully.", undefined);
                        } else {
                            // result.logo = config.BASE_URL + "storelogo/" + uploadFIleName;
                            result.logo = "storelogo/" + uploadFIleName;
                            callback(undefined, result);
                        }
                    })
                })
            });
       /* } else {
            callback("Please upload Image dimension 217 X 115", undefined);
        }*/
    } else {
        callback("File not selected.", undefined);
    }
}