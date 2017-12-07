var config = require('../../config/config');
var secret = require('../../config/secret');
var groupModel = require('../../models/groupType');
var groupType = {};
groupType.addGroupType = function(req, res) {
    console.log("req.body:###3",req.body);

    groupModel.findOne({name: req.body.name}, function(err, doc) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating group type", error: err });
        } else if (doc) {
            res.status(400).json({ status: "error", message: "Group Type allready exist.", docs: '' });

        } else {

            groupModel.create(req.body, function(err, doc) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while creating group type", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "Group Type created successfully", doc: doc });
                }

            })
        }
    })
};
groupType.updateGroupType = function(req, res) {


    groupModel.findByIdAndUpdate(req.params.typeId, req.body, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while updating group Type", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Group Type updated successfully", doc: doc });
            }

        })
};
groupType.deleteGroupType = function(req, res) {

    groupModel.findByIdAndUpdate(req.params.typeId, { $set: { status: "Archieved" } }, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while updating group Type", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Group Type updated successfully", doc: doc });
            }

        })
};

groupType.updateStatus = function(req, res) {
    
   //?'Archieved':'Active';
    if(req.body.status=='Active')
    {
        req.body.status='Archieved'
    }
    else
    {
        req.body.status='Active'
    }
    console.log("req.body###########",req.body.status);
    groupModel.findByIdAndUpdate(req.params.typeId, { $set: { status: req.body.status } }, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while updating group Type", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Group Type updated successfully", doc: doc });
            }

        })
};

groupType.getAllActiveGroupType = function(req, res) {
    groupModel.find({ status: "Active" }, function(err, docs) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
        } else {
            res.status(200).json({ status: "success", message: "Admin user created successfully", docs: docs });
        }

    })
};

groupType.getAllGroupType = function(req, res) {
    groupModel.find(function(err, docs) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
        } else {
            res.status(200).json({ status: "success", message: "Admin user created successfully", docs: docs });
        }

    })
};


module.exports = groupType;