var cityModel = require('../../models/city');
var storeModel = require('../../models/store');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Excel = require('exceljs');
var async = require('async')
var workbook = new Excel.Workbook();
var _ = require('underscore');

var city = {
    addCity: function(req, res) {
        req.body.location.type = "Point";
        console.log("req", req.body);
        cityModel.create(req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    getAllCities: function(req, res) {
        console.log("req", req.body);

        cityModel.find(function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    
    getCity: function(req, res) {
        console.log("req", req.body);

        cityModel.findById({ _id: req.body._id }, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    updateCity: function(req, res) {
        console.log("=--------- req", req.body);
        req.body.location.type = "Point";

        cityModel.findByIdAndUpdate(req.params.cityId, req.body, { new: true },
            function(err, doc) {
                if (err) {
                    console.log("-------- error: ", err);
                    res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, doc: '' });
                } else {
                    res.status(200).json({ status: 'success', message: 'Record added successfully', doc: doc });
                }
            });
    },
    remove: function(req, res) {

        cityModel.remove({
                _id: req.params.cityId
            },
            function(err, city) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while deleting city", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "City deleted successfully", city: city });
                }

            })
    },
    searchCity: function(req, res) {
       
        cityModel.find({ name: new RegExp(req.query.search,"i") }, function(err, stores) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "stores fetched successfully.", docs: stores });
            }
        })
    },
    saveFeaturedStore: function(req, res) {
        cityModel.update({ _id: req.params.cityId }, { $addToSet: { "featuredStores": req.body } },

            function(err, city) {
                if (err) {
                    console.log("in error");

                    res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
                } else {
                    console.log("in successfully")
                    res.status(200).json({ status: 'success', message: "stores updated successfully.", docs: city });
                }


            })
    },
    //*************featured stores****************//
    getAllStores: function(req, res) {
        console.log("in ~~~~~~~~getAllStores");
        cityModel.find().populate('featuredStores.storeId').exec(function(err, docs) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating store", error: err });
            } else {
                res.status(200).json({ status: "success", message: "store created successfully", docs: docs });
            }

        })
    },
    getAllExperiences: function(req, res) {
        console.log("in ~~~~~~~~getAllExperiences");
        cityModel.find().populate('featuredExperiences.experienceId').exec(function(err, docs) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating store", error: err });
            } else {
                res.status(200).json({ status: "success", message: "store created successfully", docs: docs });
            }

        })
    },
    removeFeaturedStore: function(req, res) {
        console.log("in ~~~~~~~~removeFeaturedStore", req.params.storeId);
        cityModel.findOneAndUpdate({ "_id": ObjectId(req.params.cityId) }, { $pull: { 'featuredStores': { _id: ObjectId(req.params.storeId) } } })
            .exec(function(err, doc) {
                if (err) {
                    console.log("error", err);
                    res.status(500).json({ status: "error", message: "Error while Removing store", error: err });
                } else {
                    console.log("data", doc)
                    res.status(200).json({ status: "success", message: "store Removed successfully", docs: doc });
                }
            })

    },
    saveFeaturedExperiences: function(req, res) {
        console.log("in saveFeaturedExperiences....", req.body)
        cityModel.update({ _id: req.params.cityId }, { $addToSet: { "featuredExperiences": req.body } },

            function(err, city) {
                if (err) {
                    console.log("in error");

                    res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
                } else {
                    console.log("in successfully")
                    res.status(200).json({ status: 'success', message: "featured Experiences updated successfully.", docs: city });
                }


            })
    },
    removeFeaturedExperience: function(req, res) {
        console.log("in ~~~~~~~~removeFeaturedExperience", req.params.expId);
        cityModel.findOneAndUpdate({ "_id": ObjectId(req.params.cityId) }, { $pull: { 'featuredExperiences': { _id: ObjectId(req.params.expId) } } })
            .exec(function(err, doc) {
                if (err) {
                    console.log("error", err);
                    res.status(500).json({ status: "error", message: "Error while Removing store", error: err });
                } else {
                    console.log("data", doc)
                    res.status(200).json({ status: "success", message: "store Removed successfully", docs: doc });
                }
            })

    },
    addMultiCities: function(req, res) {

        var fileExtension = '.' + req.file.originalname.split('.').pop();
        if (fileExtension == ".csv") {

            workbook.csv.readFile(req.file.path)
                .then(function(data) {
                    readCityFile(res, data, req.body.country);
                });

        } else if (fileExtension == ".xlsx" || fileExtension == ".xls") {
            console.log("req.file", req.file)
            workbook.xlsx.readFile(req.file.path)
                .then(function(data) {
                    readCityFile(res, data, req.body.country);
                });
        }

    }

};

module.exports = city;


function readCityFile(res, data, countryCode) {
    var worksheet = workbook.getWorksheet(data.name);

    var citiesData = [];
    var condition = [];
    var count = 0;
    var j = 0;

    if (countryCode != 'undefined' && countryCode) {
        condition = [{ $match: { country: countryCode } }, { $project: { name: 1, country: 1, location: 1, _id: 0 } }];
    } else {
        condition = [{ $project: { name: 1, country: 1, location: 1, _id: 0 } }];
    }

    console.log("condition", condition);
    cityModel.aggregate(condition, function(err, doc) {
        if (!err && doc) {
            console.log("document", doc.length)

            async.each(worksheet._rows, function(row, nextCity) {
                var rowData = {};
                var flag = true;
                count++;
                j++;

                if (countryCode != 'undefined' && row.values[1] != null && row.values[1] != countryCode) {
                    flag = false;
                } else {
                    flag = true;
                }

                if (j > 1) {
                    if (row.values[1] != null && row.values[2] != null && row.values[6] != null && row.values[7] != null && flag == true) {
                        rowData.name = row.values[2];
                        rowData.country = row.values[1];
                        rowData.location = {};
                        rowData.location.coordinates = [row.values[7], row.values[6]];
                        rowData.location.type = "Point";

                        var newCity = [rowData].filter(comparer(doc));

                        if (newCity.length > 0) {
                            citiesData.push(newCity[0])
                        }
                    }
                }
                if (worksheet._rows.length === j) {
                    console.log("citiesData", citiesData.length)
                    if (citiesData.length > 0) {
                        cityModel.insertMany(citiesData, function(err, cityRecord) {
                            if (!err && cityRecord) {
                                console.log("step 1")
                                res.status(200).json({ status: "success", message: "cities added successfully....", docs: citiesData });
                            } else {
                                console.log("step 2", err)
                                res.status(500).json({ status: "error", message: "Error while adding cities", error: err });
                            }
                        })
                    } else {
                        console.log("step 3")
                        res.status(500).json({ status: "error", message: "No new cities present in file", error: err });
                    }

                }
                nextCity(row[j])
            })
        } else {
            console.log("step 4")
            res.status(500).json({ status: "error", message: "Error while adding cities", error: err });
        }
    })

}

function comparer(otherArray) {
    return function(current) {
        return otherArray.filter(function(other) {
            return other.location.coordinates[0] == current.location.coordinates[0] && other.location.coordinates[1] == current.location.coordinates[1]
        }).length == 0;
    }
}