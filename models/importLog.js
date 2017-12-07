var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var importLogSchema = mongoose.Schema({
    country: String,
    lastImportStartDate: Date,
    lastImportCompleteDate: Date,

});

importLogSchema.plugin(timestamps);

module.exports = mongoose.model('importLog', importLogSchema);