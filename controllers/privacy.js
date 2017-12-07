var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');

var aboutUs = {

    default: function(req, res) {
        res.render('static-pages/privacy-policy.html', { data: {title:'Privacy-Policy | Brand Label',userDetails: req.session.userModel, city: req.session.userCity} });
    }
}

module.exports = aboutUs;
