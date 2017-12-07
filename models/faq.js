var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var faqSchema = mongoose.Schema({
    faqId: Number,
    title: String,
    description: String,
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'master' }, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'master' },
    featured: Boolean
});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
faqSchema.plugin(autoIncrement.plugin, { model: 'faq', field: 'faqId', startAt: 1, incrementBy: 1 });

faqSchema.plugin(timestamps);



module.exports = mongoose.model('faq', faqSchema);