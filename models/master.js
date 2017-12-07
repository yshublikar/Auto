var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');


var masterSchema = mongoose.Schema({
	masterId: Number,
    masterKey: String,
    masterValue: String,
});

masterSchema.plugin(timestamps);
var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
masterSchema.plugin(autoIncrement.plugin, { model: 'master', field: 'masterId', startAt: 1, incrementBy: 1 });




module.exports = mongoose.model('master', masterSchema);