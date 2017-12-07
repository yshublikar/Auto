// var businessHelper = require('../helpers/businessHelper');
// var config = require('../config/config.js');
var makeNodel = require('../../models/make.js');
var _ = require('underscore');
var fs = require("fs");
var sizeOf = require('image-size');

var makes = {

    create: function(req, res) {
        console.log("req.files--------");
        console.log(req.files);

        req.body.offers = JSON.parse(req.body.offers);

        if (req.query.id) {
            console.log("file------------------------------11");

            var file = _.findWhere(req.files, { 'fieldname': 'brandingImage' });
            var logoFile = _.findWhere(req.files, { 'fieldname': 'logo' });
            if (file || logoFile) {
                if (file) {
                    var getSize = sizeOf(file.path);
                    var fileExtension = '.' + file.originalname.split('.').pop();
                    var uploadFIleName = "makes/brand-" + new Date().getTime() + fileExtension;
                    var fileName = "./uploads/" + uploadFIleName;
                    fs.readFile(file.path, function(err, data) {
                        fs.writeFile(fileName, data, function(err) {
                            if (err) {
                                res.status(500).json({ status: 'error', message: "File not uploaded successfully.", docs: "" });
                            } else {
                                req.body.brandingImage = uploadFIleName;
                                makeNodel.findByIdAndUpdate(req.query.id, req.body, { new: true }, function(err, make) {
                                    if (err) {
                                        res.status(500).json({ status: 'error', message: "File not uploaded successfully.", docs: "" });
                                    } else {
                                        res.status(200).json({ status: 'success', message: "File uploaded successfully.", doc: make });
                                    }
                                })


                            }
                        });
                    });

                }
                if (logoFile) {

                    var logoFileExtension = '.' + logoFile.originalname.split('.').pop();
                    var uploadLogoName = "makes/logo-" + new Date().getTime() + logoFileExtension;
                    var logoFileName = "./uploads/" + uploadLogoName;
                    fs.readFile(logoFile.path, function(err, data) {
                        fs.writeFile(logoFileName, data, function(err) {
                            if (err) {
                                res.status(500).json({ status: 'error', message: err, docs: "" });
                            } else {

                                req.body.logo = uploadLogoName;
                                makeNodel.findByIdAndUpdate(req.query.id, req.body, { new: true }, function(err, make) {
                                    if (err) {
                                        res.status(500).json({ status: 'error', message: "File not uploaded successfully.", docs: "" });
                                    } else {
                                        res.status(200).json({ status: 'success', message: "File uploaded successfully.", doc: make });
                                    }
                                })



                            }
                        });
                    });


                }

            } else {
                makeNodel.findByIdAndUpdate(req.query.id, req.body, { new: true }, function(err, make) {
                    if (err) {
                        res.status(500).json({ status: 'error', message: "File not uploaded successfully.", docs: "" });
                    } else {
                        res.status(200).json({ status: 'success', message: "File uploaded successfully.", doc: make });
                    }
                })
            }
        } else {


            var file = _.findWhere(req.files, { 'fieldname': 'brandingImage' });
            var logoFile = _.findWhere(req.files, { 'fieldname': 'logo' });
            console.log("file------------------------------");
            console.log(_.findWhere(req.files, { 'fieldname': 'brandingImage' }));

            if (file && logoFile) {


                if (file) {

                    var dimensions = sizeOf(file.path);
                    var fileExtension = '.' + file.originalname.split('.').pop();
                    var uploadFIleName = "makes/brand-" + new Date().getTime() + fileExtension;
                    var fileName = "./uploads/" + uploadFIleName;
                    fs.readFile(file.path, function(err, data) {
                        fs.writeFile(fileName, data, function(err) {
                            if (err) {
                                res.status(500).json({ status: 'error', message: err, docs: "" });
                            } else {



                            }
                        });
                    });

                }
                if (logoFile) {
                    var logoFileExtension = '.' + logoFile.originalname.split('.').pop();
                    var uploadLogoName = "makes/logo-" + new Date().getTime() + logoFileExtension;
                    var logoFileName = "./uploads/" + uploadLogoName;
                    fs.readFile(logoFile.path, function(err, data) {
                        fs.writeFile(logoFileName, data, function(err) {
                            if (err) {
                                res.status(500).json({ status: 'error', message: err, docs: "" });
                            } else {


                            }
                        });
                    });
                }
                req.body.brandingImage = uploadFIleName;
                req.body.logo = uploadLogoName;
                makeNodel.create(req.body, function(err, make) {
                    if (err) {
                        res.status(500).json({ status: 'error', message: err, docs: "" });
                    } else {
                        res.status(200).json({ status: 'success', message: "File uploaded successfully.", doc: make });
                    }
                })


            } else {
                res.status(500).json({ status: 'error', message: "Branding image or Logo image is not uploaded.", docs: "" });
            }

        }

    },

    uploadOffer: function(req, res) {
        console.log("req.files--------");
        console.log(req.files);

        var file = _.findWhere(req.files, { 'fieldname': 'offerImage' });
        // var offerDimensions = sizeOf(file.path);

        var fileExtension = '.' + file.originalname.split('.').pop();
        var uploadFIleName = "makes/offer-" + new Date().getTime() + fileExtension;

        var fileName = "./uploads/" + uploadFIleName;
        /* if(offerDimensions.width==369 && offerDimensions.height==240)
              {*/

        fs.readFile(file.path, function(err, data) {
            fs.writeFile(fileName, data, function(err) {
                if (err) {
                    res.status(500).json({ status: 'error', message: "File not uploaded successfully.", docs: "" });
                } else {
                    res.status(200).json({ status: 'success', message: "File uploaded successfully.", doc: uploadFIleName });
                }
            });
        });


        /*  }
          else
          {
           res.status(500).json({ status: 'error', message: "Offer Image dimension should be 369 X 240.", docs: "" });
              
        }*/
    },

    getAll: function(req, res) {
        makeNodel.find({}).
        exec(function(err, makes) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Makes fetched successfully.", docs: makes });
            }
        })
    },

    delete: function(req, res) {
        makeNodel.remove({ _id: req.params.id }, function(err, make) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Make deleted successfully.", doc: '' });
            }
        })
    },

    getOne: function(req, res) {
        makeNodel.findById(req.params.id, function(err, make) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Make fetched successfully.", doc: make });
            }
        })
    },
}

module.exports = makes;