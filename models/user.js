var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var config = require('../config/config');

var userSchema = mongoose.Schema({
    userId: Number,
    warnedCount:{type:Number,default:0},
    facebookId:String,
    name:String,
    phone:String,
    displayName: String,
    email:String,
    about:String,
    location:String,
    profileViews:{type: Number, default: 0},
    visitedCount:[],
    lastLoggedIn:Date,
    profileImage:String,
    avatarImage:{type:String, default:'img/user-demo.png'},
    anonymous: {type:Boolean, default:true},
    emailMeMyMessages: {type:Boolean, default:true},
    notification: String, // Daily, Weekly, Monthly and Never
    isSubscribed: Boolean, //Subscribed for newsletter
    status:{type:String,enum:['Active','Banned'], default:'Active'}
    
});


var connection = mongoose.createConnection(config.mongo.url);
autoIncrement.initialize(connection);
userSchema.plugin(autoIncrement.plugin, { model: 'user', field: 'userId', startAt: 1, incrementBy: 1 });

userSchema.plugin(timestamps);



module.exports = mongoose.model('user', userSchema);