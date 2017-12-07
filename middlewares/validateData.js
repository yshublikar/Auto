var validator = require('validator');
var _ = require('underscore');

var validations = {
    process: function(validateRules) {

        var middleware = function(req, res, next) {
            sendResponse(validate(req.body, validateRules), res, next);
        }
        return middleware;
    }
};

function sendResponse(validationErrors, res, next) {
    if (validationErrors.length > 0) {
        
        res.status(400).json({ status: 'validationError', message: validationErrors, docs: '' });

    } else {
        
        next();
    }
}

function validate(data, rules) {


    var validationErrors = [];
    var fields = _.keys(rules);
  
    _.each(fields, function(field) {

        var fieldErrors = checkValidationRule(field, data[field], rules[field]);


        if (fieldErrors.length > 0) {
            

            var obj = {};
            obj[field] = fieldErrors;

            validationErrors.push(obj);
        }
    });

    return validationErrors;

}

function checkValidationRule(field, value, fieldRules) {
    var rules = _.keys(fieldRules);

    var errorMessages = [];

    _.each(rules, function(rule) {
        try{

            

        switch (rule) {

            case "required":
                if (value == undefined) {
                    errorMessages.push("The " + field + " field is required");
                } else {
                    if (value.length == 0) {
                        errorMessages.push("The " + field + " field is required");
                    }
                }
                break;

            case "isAlpha":
                if (!validator.isAlpha(value)) {
                    errorMessages.push("The " + field + " field may only contain alphabetical characters.");
                }
                break;
            case "isNumeric":
                if (!validator.isNumeric(value)) {
                    errorMessages.push("The " + field + " field must contain only numbers.");
                }
                break;
            case "isAlphanumeric":
                if (!validator.isAlphanumeric(value)) {
                    errorMessages.push("The " + field + " field may only contain alpha-numeric characters.");
                }
                break;
            case "isEmail":
                if (!validator.isEmail(value)) {
                    errorMessages.push("The " + field + " field must contain a valid email address.");
                }
                break;
            case "isURL":
                if (!validator.isURL(value)) {
                    errorMessages.push("The " + field + " field must contain a valid URL.");
                }
                break;
            case "isIn":
                if (!validator.isIn(value, fieldRules.isIn)) {
                    errorMessages.push("The " + field + " field contain invalid value.");
                }
                break;
            case "minLength":
                if (value.length < fieldRules.minLength) {
                    errorMessages.push("The " + field + " field must be at least " + fieldRules.minLength + " characters in length. ");
                }
                break;
            case "maxLength":
                if (value.length > fieldRules.maxLength) {
                    errorMessages.push("The " + field + " field cannot exceed " + fieldRules.maxLength + " characters in length.");
                }
                break;
            case "exactLength":
                if (value.length != fieldRules.exactLength) {
                    errorMessages.push("The " + field + " field must be exactly " + fieldRules.exactLength + " characters in length.");
                }
                break;
            case "matchesRegEx":
                if (!fieldRules.matchesRegEx.test(value)) {
                    errorMessages.push("The " + field + " field is not in the correct format.");
                }
                break;

            case "isUnique":

                var array = fieldRules.isUnique.split("|");
                var model = require('../models/' + array[0]);
                console.log("Checking isUnique");
                //created object as if we pass array with index to fineOne directly, 
                //it does not evaluate the values
                var conditionObject = {};
                conditionObject[array[1]] = value;

                model.findOne(conditionObject,
                    function(err, record) {

                        
                        console.log("inside response");
                        if (_.isEmpty(record)) {

                        } else {
                            console.log("validation error");
                            errorMessages.push("The " + field + " field must be unique.");
                        }
                    });

                break;

            default:
                break;
        }
        }catch(error){
            
        }

    });

    return errorMessages;

}


module.exports = validations;
