var config = require('../../config/config');
var carmodel = require('../../models/carModel');

var carModel = {};
carModel.addCarModel = function(req, res) {
    carmodel.findOne({ model: req.body.model }, function(err, doc) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
        } else if (doc) {
            res.status(400).json({ status: "error", message: "ALready exist" });
        } else {
            carmodel.create(req.body, function(err, doc) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "carModel created successfully", doc: doc });
                }

            })
        }
    })
};
carModel.updateCarModel = function(req, res) {
    carmodel.findByIdAndUpdate(req.params.carModelId, req.body, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
            } else {
                res.status(200).json({ status: "success", message: "car model created successfully", doc: doc });
            }

        })
};
carModel.deleteCarModel = function(req, res) {
    carmodel.remove({
            _id: req.params.carModelId
        },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
            } else {
                res.status(200).json({ status: "success", message: "car model created successfully", doc: doc });
            }

        })
};
carModel.getOneCarModel = function(req, res) {
    carmodel.findById(req.params.carModelId,
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
            } else {
                res.status(200).json({ status: "success", message: "car model created successfully", doc: doc });
            }

        })
};
carModel.getAllCarModels = function(req, res) {
    carmodel.find().populate('makeId').populate('bodyStyle').populate('segmentType').populate('variants.engineType')
        .sort({ "makeId.name": -1, "model": -1 })
        .exec(function(err, docs) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating car model", error: err });
            } else {
                res.status(200).json({ status: "success", message: "car model fatched successfully", docs: docs });
            }

        })


};

module.exports = carModel;