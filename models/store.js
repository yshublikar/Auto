var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');
var storeSchema = mongoose.Schema({

    makeId: { type: mongoose.Schema.Types.ObjectId, ref: 'make' }, //Make id from make collection
    storeId: Number,
    externalId: String, //ReferenceId from FourSquare API,
    manuallyUpdated: { type: Boolean, default: false }, //to prevent cronjob to update info once updated manually
    name: String,
    vanityUrl: String, // Create this value while adding store
    type: { type: String, enum: ['Dealership', 'Workshop'], default: 'Dealership' },
    shortDescription: String,
    logo: String, //relative path of logo from base url of API
    address: String, //
    city: String,
    state: String,
    country: String,
    location: { 'type': { type: String, enum: "Point", default: "Point" }, coordinates: { type: [Number], default: [0, 0] } }, //in cordinate firsst must be a longitude and then lattitude 
    phone: String,
    email: String,
    website: String, // must be with http or https
    workingHours: [{ day: String, start: Number, end: Number, closed: Boolean }], //use date as 1/1/1970
    featured: Boolean,
    overallRating: Number,
    recommendedScore: {type: Number,default: 0},
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
    status: { type: String, enum: ['Approved', 'Pending', 'Active'], default: 'Active' },
    visitedCount:  []

});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
storeSchema.plugin(autoIncrement.plugin, { model: 'store', field: 'storeId', startAt: 1, incrementBy: 1 });

storeSchema.plugin(timestamps);
storeSchema.index({ location: '2dsphere' });



module.exports = mongoose.model('store', storeSchema);