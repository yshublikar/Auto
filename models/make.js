var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var makeSchema = mongoose.Schema({

    makeId:Number,
    name: String,
    vanityUrl: String,  // Create this value while adding make
    logo:String,
    brandingImage: String, //relative path of logo from base url of API
    offers:[{
        title:String,
        shortDescription:String,
        fullDescription:String,
        image:String,
    }]
    
});

var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
makeSchema.plugin(autoIncrement.plugin, { model: 'make', field: 'makeId', startAt: 1, incrementBy: 1 });

makeSchema.plugin(timestamps);




module.exports = mongoose.model('make', makeSchema);