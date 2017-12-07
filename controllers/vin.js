var fs = require('fs');
var path = require('path');

var VIN = {
    getVIN: function(req, res) {
        var vin = (req.params.vin).trim();
        if (validate(vin)) {
            var data = decode(vin)
            if (data) {
                res.status(200).json({ status: "success", message: "VIN", data: data });
            } else {
                res.status(500).json({ status: "error", message: "Errors while getting VIN" })
            }
        } else {
            res.status(500).json({ status: "error", message: "Errors while getting VIN" })
        }
    }
}
module.exports = VIN;


var countries = JSON.parse(fs.readFileSync(path.join('data', 'countries.json'), "utf8"));
var manufacturers = JSON.parse(fs.readFileSync(path.join('data', 'manufacters.json'), "utf8"));

var yearCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

var validate = function(vin) {
    if (vin.length == 0)
        return false;

    if (vin.length != 17)
        return false;

    return true;
};

var split = function(vin) {
    var INDEXES = {
        MADE_IN_START: 0,
        MADE_IN_END: 2,
        MANUFACTURER_START: 0,
        MANUFACTURER_END: 3,
        DETAILS_START: 3,
        DETAILS_END: 8,
        SECURITY_CODE: 8,
        YEAR: 9,
        ASSEMBLY_PLANT: 10,
        SERIAL_NUMBER_START: 11
    };

    var rawInfo = {
        madeIn: vin.substring(INDEXES.MADE_IN_START, INDEXES.MADE_IN_END),
        manufacturer: vin.substring(INDEXES.MANUFACTURER_START, INDEXES.MANUFACTURER_END),
        details: vin.substring(INDEXES.DETAILS_START, INDEXES.DETAILS_END),
        securityCode: vin.charAt(INDEXES.SECURITY_CODE),
        year: vin.charAt(INDEXES.YEAR),
        assemblyPlant: vin.charAt(INDEXES.ASSEMBLY_PLANT),
        serialNumber: vin.substring(INDEXES.SERIAL_NUMBER_START)
    };

    return rawInfo;
};


var lookup = function(keyName, key, elements) {
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element[keyName] == key)
            return element;
    }

    return '';
};

var getCountry = function(countryCode) {
    var country = lookup('code', countryCode, countries);
    return country.name;
};

var getManufacturer = function(manufacturerCode) {
    var manufacturer = lookup('code', manufacturerCode, manufacturers);
    return manufacturer.name;
};

var getYear = function(code) {
    var now = new Date();
    var currentYear = now.getFullYear();

    var yearOffset = yearCodes.indexOf(code);

    if (yearOffset === -1) {
        return [];
    }

    var possibleYears = [2010 + yearOffset, 1980 + yearOffset];

    /*   if (possibleYears[1] > currentYear) {
           return possibleYears[0];
       }
       if (possibleYears[0] > currentYear) {
           return possibleYears[0];
       }*/
    return possibleYears[0] + "";
};

var decode = function(vin) {
    var codeValues = split(vin);
    console.log("details", codeValues.details)
    console.log("securityCode", codeValues.securityCode)
    console.log("year", codeValues.year)
    console.log("assemblyPlant", codeValues.assemblyPlant)

    var carInfo = {
        country: getCountry(codeValues.madeIn),
        serialNumber: codeValues.serialNumber,
        manufacturer: getManufacturer(codeValues.manufacturer),
        details: codeValues.details,
        securityCode: codeValues.securityCode,
        year: getYear(codeValues.year),
        assemblyPlant: codeValues.assemblyPlant
    };

    return carInfo;
};

/*module.exports = {
  validate: validate,
  split: split,
  decode: decode,
  VIN : VIN
};*/