var mongoose = require('mongoose');
var configSchema = new mongoose.Schema({
    key: { type: String },
    value: { type:String }
});


// FAQ Sections, Categories
// Spedometer Config  


module.exports = mongoose.model('config', configSchema);