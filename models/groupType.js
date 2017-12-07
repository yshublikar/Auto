var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var groupTypeSchema = mongoose.Schema({

    groupTypeId: Number,
    name: String,
    editable: {type:Boolean, default: true},
    status: { type: String, enum: ['Active', 'Archieved'], default: 'Active' }
});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
groupTypeSchema.plugin(autoIncrement.plugin, { model: 'groupType', field: 'groupTypeId', startAt: 1, incrementBy: 1 });

groupTypeSchema.plugin(timestamps);

module.exports = mongoose.model('groupType', groupTypeSchema);