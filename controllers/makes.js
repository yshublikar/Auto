var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');
var makeModel = require('../models/make.js');

var makes = {

    create: function(req, res) {
    	console.log("req.files--------");
    	console.log(req.files);
        // res.status(200).json({ status: 'success', message: 'success', docs: users });
        // res.render('compare.html', { data: {title:'Brand Label'} });

    },
    getMakes: function(req, res){
    	 console.log('----------- query: ', req.query.q);

        if (req.query.q && req.query.q.length > 1) {

            makeModel.find({ name: { $regex: new RegExp(req.query.q, "i") } })
                .limit(10)
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
            console.log("no value provided in the query.");
            res.status(500).json({ status: 'error', message: 'Must provide minimum two characters to search.', docs: [] });
        }
    }
}

module.exports = makes;