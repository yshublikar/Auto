var config = require('../../config/config');
var request = require('request');
var storeModel = require('../../models/store');
var cityModel = require('../../models/city');
var importLogModel = require('../../models/importLog');

var moment = require('moment');
var _ = require('underscore');
var envConfig = require('../../models/config');
var async = require('async')
var toTitleCase = require('titlecase')
var fourSquare = {};

fourSquare.createAndUpdateStores = function(req, res) {
    console.log("##### createAndUpdateStores started....")

    if (!config.fourSquare || !config.fourSquare.url || !config.fourSquare.client_id || !config.fourSquare.client_secret || !config.fourSquare.categoryId || !config.fourSquare.v) {
        res.status(400).json({ status: "error", message: "Four square configuration not found" });
        return;
    }

    var url = config.fourSquare.url + "venues/search?";
    _.each(config.fourSquare, function(value, key) {
        if (key != "url") {
            url += key + "=" + value + "&";
        }
    })

    var options = {
        method: 'GET',
        body: {},
        json: true,
        url: url
    }

    importLogModel.findOne({ lastImportCompleteDate: null }, function(err, country) {
        if (err) {
            console.log("##### Error while getting country", err)
            if (res)
                res.status(500).json({ status: 'error', message: ' Error while getting country' });
        } else if (country) {
            console.log('##### start getting city for country ' + country.country || "India");
            // console.log("##### days before fetched.", parseInt(days.value))
            // var lastStoresFetched = moment().subtract(parseInt(days.value), 'days');
            // console.log("##### lastStoresFetched....", lastStoresFetched)
            // var startOf = lastStoresFetched.clone().startOf('day')
            // var endOf = lastStoresFetched.clone().endOf('day')
            cityModel.findOne({
                $or: [{ country: country.country, lastStoresFetched: { $lte: new Date(country.lastImportStartDate) } },
                    { country: country.country, lastStoresFetched: null }
                ]
            }, function(err, city) {

                if (err) {
                    console.log("##### Error while getting city", err)
                    if (res)
                        res.status(500).json({ status: 'error', message: 'Error while getting city' });
                } else if (city) {
                    var errors = [];
                    console.log('##### start getting stores for city ' + city.name || "Pune");
                    options.url += "near=" + city.name || "Pune";
                    request(options, function(err, response, body) {
                        if (err) {
                            console.log("##### Error from four square server for city " + city.name, err)
                            if (res)
                                res.status(500).json({ status: 'error', message: 'Error From four square server', error: err });

                        } else if (response.statusCode === 200) {
                            console.log('##### total stores found ' + body.response.venues.length);
                            var j = 0;
                            // res.status(200).json({ status: 'error', message: 'Error From four square server', error: response.body });

                            async.eachSeries(body.response.venues, function(vennue, nextVennue) {
                                var store = initializeData(vennue, city)
                                storeModel.findOneAndUpdate({ externalId: vennue.id, manuallyUpdated: false }, store, { new: true }, function(err, updatedStore) {
                                    j++;
                                    if (err) {
                                        errors.push({ meassage: " Error while updating store " + vennue.name, err: err });
                                        if (body.response.venues.length === j) {
                                            sendResponse(req, res, errors, city)
                                        }
                                        nextVennue(vennue[j]);
                                    } else if (updatedStore) {
                                        console.log('##### Update No ', j);
                                        city.lastStoresFetched = moment();
                                        city.save();
                                        if (body.response.venues.length === j) {
                                            sendResponse(req, res, errors, city)
                                        }
                                        nextVennue(vennue[j]);

                                    } else {
                                        /// checking is already exists...
                                        storeModel.findOne({ externalId: vennue.id }, function(err, skiipedStore) {
                                            if (err) {
                                                errors.push({ meassage: " Error while finding store " + vennue.name, err: err });
                                                if (body.response.venues.length === j) {
                                                    sendResponse(req, res, errors, city)
                                                }
                                                nextVennue(vennue[j]);
                                            } else if (skiipedStore) {
                                                console.log('##### skiipedStore No ', j);
                                                if (body.response.venues.length === j) {
                                                    sendResponse(req, res, errors, city)
                                                }
                                                nextVennue(vennue[j]);

                                            } else {
                                                /// creating new store....

                                                storeModel.create(store, function(err, newStore) {
                                                    if (err) {
                                                        errors.push({ meassage: " Error while creating store " + vennue.name, err: err });
                                                        if (body.response.venues.length === j) {
                                                            sendResponse(req, res, errors, city)
                                                        }
                                                        nextVennue(vennue[j]);
                                                    } else {
                                                        console.log('##### Create No ', j);

                                                        if (body.response.venues.length === j) {

                                                            sendResponse(req, res, errors, city)
                                                        }
                                                        nextVennue(vennue[j]);

                                                    }

                                                })
                                            }

                                        })

                                    }
                                })

                            });

                        } else {
                            console.log("##### Error from four square server for city " + city.name, response.body)
                            if (res)
                                res.status(500).json({ status: 'error', message: 'Error From four square server', error: response.body });
                        }
                    })
                } else {
                    country.lastImportCompleteDate = new Date();
                    country.save();
                    console.log("##### no city found for ", country.country)
                    if (res)
                        res.status(400).json({ status: 'error', message: " No city found for " + country.country });
                }
            })


        } else {
            console.log("##### no country found which has lastImportCompleteDate null  ")
            if (res)
                res.status(400).json({ status: 'error', message: " no country found which has lastImportCompleteDate null " });
        }
    })


};
fourSquare.getImportCountries = function(req, res) {
    cityModel.distinct('country', { lastStoresFetched: null }, function(err, countries) {
        if (err) {
            console.log("##### Error while getting new countries", err)
            if (res)
                res.status(500).json({ status: 'error', message: 'Error while getting how many day before store fetched' });
        } else if (countries.length > 0) {
            console.log("Total countries", countries.length)
            var i = 0;
            async.eachSeries(countries, function(country, nextVennue) {
                importLogModel.findOne({ country: toTitleCase(country) }, function(err, data) {
                    // console.log(country)
                    i++;
                    if (err) {
                        console.log("##### Error while getting ", country)
                        if (i === countries.length) {
                            updateImportLog()
                        }
                        nextVennue(country[country.length + 1]);
                    } else if (!data) {
                        console.log("#### New Creation in Import logs", country)
                        importLogModel.create({ country: toTitleCase(country), lastImportStartDate: new Date(), lastImportCompleteDate: null }, function(err, data) {
                            if (i === countries.length) {
                                updateImportLog()
                            }
                            nextVennue(country[country.length + 1]);
                        })
                    } else {
                        console.log("#### Already Exist In Import Logs", country)
                        if (i === countries.length) {
                            updateImportLog()
                        }
                        nextVennue(country[country.length + 1]);
                    }
                })

            })

        } else {
            updateImportLog()
        }

    })
}

module.exports = fourSquare;

function initializeData(vennue, city) {
    var store = {
        externalId: vennue.id,
        manuallyUpdated: false,
        name: toTitleCase(vennue.name || ""),
        type: vennue.categories[0].name === 'Auto Workshop' ? 'Workshop' : 'Dealership',
        shortDescription: "",
        logo: vennue.categories[0].icon.prefix,
        location: { 'type': "Point", coordinates: [vennue.location.lat, vennue.location.lng] },
        address: vennue.location.address || (vennue.location.formattedAddress.length > 0 ? vennue.location.formattedAddress.join() : ""), //
        city: vennue.location.city || city.name,
        state: vennue.location.state || city.state,
        country: vennue.location.country || city.country,
        phone: vennue.contact.phone,
        email: "",
        website: vennue.url || "",
        featured: false,
        cityId: city._id,
        vanityUrl: (vennue.name).toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-")
    };
    return store;

}

function sendResponse(req, res, err, city) {
    city.lastStoresFetched = new Date();
    city.save();
    console.log("##### Errors in while updating ", err);
    if (res)
        res.status(200).json({ status: "success", message: "Execution COmpleted", error: err, })

}

function updateImportLog() {
    console.log("##### Updating Country which is fetched before...")
    envConfig.findOne({ key: "runCronJobEveryXDays" }, function(err, days) {
        if (err) {
            console.log("##### Error while getting how many day before store fetched", err)
            // res.status(500).json({ status: 'error', message: 'Error while getting how many day before store fetched' });
        } else if (days) {
            var date = moment(new Date()).subtract(parseInt(days.value), 'days')
            console.log("Fetching Date",date,days)
            var startDate = date.clone().startOf('day');
            var endDate = date.clone().endOf('day');
            importLogModel.update({ lastImportCompleteDate: { $gte: startDate, $lte: endDate } }, { $set: { lastImportStartDate: new Date(), lastImportCompleteDate: null } }, { multi: true }, function(err, noOfDocUpdated) {
                if (err) {
                    console.log("errr while updating importLogModel")
                } else {
                    console.log("success ", noOfDocUpdated)
                }
            })
        } else {
            console.log("##### runCronJobEveryXDays key not found in config collection")

        }
    })
}