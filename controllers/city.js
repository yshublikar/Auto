var businessHelper = require('../helpers/businessHelper');
var cityModel = require("../models/city");

var city = {

    getLimited: function(req, res) {

        console.log('----------- query: ', req.query.q);

        if (req.query.q && req.query.q.length > 1) {

            cityModel.find({ name: { $regex: new RegExp(req.query.q, "i") } })
                .limit(5)
                .exec(function(err, docs) {

                    if (docs) {
                        res.status(200).json({ status: 'success', message: 'Success', docs: docs });
                    } else if (err) {
                        res.status(500).json({ status: 'error', message: 'DB Error: ', error: err, docs: [] });
                    } else {
                        res.status(500).json({ status: 'error', message: 'Document not found.', docs: [] });
                    }
                });
        } else {
            console.log("no distance provided in the query.");
            res.status(500).json({ status: 'error', message: 'Must provide minimum two characters to search.', docs: [] });
        }
    },
}

module.exports = city;