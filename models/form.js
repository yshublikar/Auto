var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var formSchema = mongoose.Schema({

    formId: Number,
    experienceType: String, //form name
    type: { type: String, enum: ['Dealership', 'Workshop'] },
    questionGroups: [{
        name: String,
        type: { type: mongoose.Schema.Types.ObjectId, ref: 'groupType' },
        // type: { type: String, enum: ["AMENITIES", "INTEGRITY", "QUALITY_OF_WORK", "CUSTOMER_SERVICE"] },
        questions: [{
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' },
            sequenceNo: Number
        }],
        sequenceNo: Number
    }],
    questions: [{
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' },
            sequenceNo: Number
    }],
    status: { type: String, enum: ['Active', 'Archieved'] }

});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
formSchema.plugin(autoIncrement.plugin, { model: 'form', field: 'formId', startAt: 1, incrementBy: 1 });

formSchema.plugin(timestamps);

module.exports = mongoose.model('form', formSchema);