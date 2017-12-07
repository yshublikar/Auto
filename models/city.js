var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var citySchema = mongoose.Schema({

    cityId: Number,
    name: String,
    state: String,
    country: String,
    location: { 'type': { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], default: [0, 0] } },
    lastStoresFetched:Date,
    featuredStores: [{
    	storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'store' },
    	from : Date,
    	to: Date
    }],
    featuredExperiences: [{
    	experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'experience' },
    	from : Date,
    	to: Date
    }]

});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
citySchema.plugin(autoIncrement.plugin, { model: 'city', field: 'cityId', startAt: 1, incrementBy: 1 });

citySchema.plugin(timestamps);
// citySchema.index({ location: '2dsphere' });





module.exports = mongoose.model('city', citySchema);