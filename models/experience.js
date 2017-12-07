var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var experienceSchema = mongoose.Schema({

    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'store' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    experienceId: Number,
    incidentDate: Date,
    closedDate: Date,
    closingNotes: String,
    bestThing: String,
    worstThing: String,
    isRecommended: Boolean,
    closed: { type: Boolean, default: false },
    visitedCount: [],
    weight: { type: Number, default: 0 },
    formSnapshots: [{
        postedOn: Date,
        isInitial: { type: Boolean, default: true },
        formId: { type: mongoose.Schema.Types.ObjectId, ref: 'form' },
        questionGroupData: [{ groupType: { type: mongoose.Schema.Types.ObjectId, ref: "groupType" }, value: Number }], // [{type:'AMENITIES', value:4(avg)}]
        questions: [{ questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' }, groupId: String, value: Number }],
    }],

    posts: [{
        postedOn: { type: Date, default: Date.now },
        incidentDate: Date,
        rating: Number,
        title: String,
        description: String,
        comments: [{
            postedOn: Date,
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            comment: String,
            likes: [{ like: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, date: { type: Date, default: Date.now } }],
            flagged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
        }],
        likes: [{ like: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, date: { type: Date, default: Date.now } }],
        flagged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
    }],

    vehicle: {
        carModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'carModel' },
        variantId: { type: mongoose.Schema.Types.ObjectId },
        year: String,
        vin: String
    },

    featured: Boolean,
    status: { type: String, enum: ['Open', 'Closed'] },
    submitted: { type: Boolean, default: false }

});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
experienceSchema.plugin(autoIncrement.plugin, { model: 'experience', field: 'experienceId', startAt: 1, incrementBy: 1 });

experienceSchema.plugin(timestamps);



module.exports = mongoose.model('experience', experienceSchema);