var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var adminSchema = mongoose.Schema({
    adminuserId: Number,
    firstName: String,
    lastName:String,
    email:String,
    password:String,
    status:{type:String,enum:['Active','Banned'], default:'Active'}
    
});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
adminSchema.plugin(autoIncrement.plugin, { model: 'admin', field: 'adminuserId', startAt: 1, incrementBy: 1 });

adminSchema.plugin(timestamps);



module.exports = mongoose.model('admin', adminSchema);