var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var questionSchema = mongoose.Schema({

    questionId:Number,
    displayText: String,
    type: {type:String, enum:["Rating","Opinion","Boolean"]},
    options: [{text:String, value:Number}],
    status: { type: String, enum: ['Active', 'Archieved'], default: 'Active' }
    
});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
questionSchema.plugin(autoIncrement.plugin, { model: 'question', field: 'questionId', startAt: 1, incrementBy: 1 });

questionSchema.plugin(timestamps);




module.exports = mongoose.model('question', questionSchema);