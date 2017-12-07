var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');


var carModelSchema = mongoose.Schema({
    carModelId: Number,
    makeId: { type: mongoose.Schema.Types.ObjectId, ref: 'make' },
    model: String,
    bodyStyle: { type: mongoose.Schema.Types.ObjectId, ref: 'master' },
    segmentType: { type: mongoose.Schema.Types.ObjectId, ref: 'master' },
    variants: [{
        name: String,
        engineType: { type: mongoose.Schema.Types.ObjectId, ref: 'master' },
    }]


});

var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
carModelSchema.plugin(autoIncrement.plugin, { model: 'carModel', field: 'carModelId', startAt: 1, incrementBy: 1 });

carModelSchema.plugin(timestamps);




module.exports = mongoose.model('carModel', carModelSchema);