var businessHelper = require('../helpers/businessHelper');
var config = require('../config/config.js');
var storeModel = require('../models/store');
var async = require('async')
var ObjectId = require('mongodb').ObjectID;
var _ = require('underscore');
var experience = require('../models/experience');
var config = require('../config/config');

var compare = {

    default: function(req, res) {
        var data = {
            title: 'Compare | Brand Label',
            activeMenu: 'compare',
            userDetails: req.session.userModel,
            city: req.session.userCity
        }
        res.render('compare.html', { data: data });
    },
    getComparedStores: function(req, res) {
        var data = [];
        _.each(req.query.storeIds.split(','), function(id) {
            data.push(ObjectId(id));
        })
        if (!req.query.storeIds || data.length === 0) {
            res.status(500).json({ status: "error", message: "Input not provided." });
            return;
        }
        if (data.length > 4) {
            res.status(500).json({ status: "error", message: "No of stores compare exceeded." });
            return;
        }
        if (!req.session.userCity) {
            res.status(500).json({ status: "error", message: "Please select city." });
            return;
        }

        storeModel.aggregate([{ $match: { _id: { $in: data } } },
                {
                    $lookup: {
                        from: "experiences",
                        localField: "_id",
                        foreignField: "storeId",
                        as: "experience"
                    }
                },
                {
                    $unwind: {
                        "path": "$experience",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        "path": "$experience.posts",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "experience.userId",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $lookup: {
                        from: "makes",
                        localField: "makeId",
                        foreignField: "_id",
                        as: "make"
                    }
                },
                {
                    $unwind: {
                        "path": "$make",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",

                        make: { $first: "$make" },

                        manuallyUpdated: { $first: "$manuallyUpdated" },
                        name: { $first: "$name" },
                        vanityUrl: { $first: "$vanityUrl" },
                        type: { $first: "$type" },
                        shortDescription: { $first: "$shortDescription" },
                        logo: { $first: "$logo" },
                        address: { $first: "$address" },
                        city: { $first: "$city" },
                        state: { $first: "$state" },
                        country: { $first: "$country" },
                        location: { $first: "$location" },
                        phone: { $first: "$phone" },
                        email: { $first: "$email" },
                        website: { $first: "$website" },
                        workingHours: { $first: "$workingHours" },
                        featured: { $first: "$featured" },
                        overallRating: { $first: "$overallRating" },
                        recommendedScore: { $first: "$recommendedScore" },
                        cityId: { $first: "$cityId" },
                        status: { $first: "$status" },
                        "experience": {
                            $push: { exp: "$experience", user: "$user" }
                        }
                    }
                }, {
                    $project: {
                        make: "$make",
                        manuallyUpdated: "$manuallyUpdated",
                        name: "$name",
                        vanityUrl: "$vanityUrl",
                        type: "$type",
                        shortDescription: "$shortDescription",
                        logo: "$logo",
                        address: "$address",
                        city: "$city",
                        state: "$state",
                        country: "$country",
                        location: "$location",
                        phone: "$phone",
                        email: "$email",
                        website: "$website",
                        workingHours: "$workingHours",
                        featured: "$featured",
                        overallRating: "$overallRating",
                        recommendedScore: "$recommendedScore",
                        cityId: "$cityId",
                        status: "$status",
                        bests: {
                            $filter: {
                                input: "$experience",
                                as: "item",
                                cond: { $gte: ["$$item.exp.posts.rating", 4] }
                            }
                        },
                        worst: {
                            $filter: {
                                input: "$experience",
                                as: "item1",
                                cond: { $lte: ["$$item1.exp.posts.rating", 2] }
                            }
                        }
                    }

                }

            ],
            function(err, stores) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while getting stores " + err });

                } else if (stores.length > 0) {
                    var i = 0;
                    async.eachSeries(stores, function(store, nextStore) {
                        experience.aggregate([{
                                    $match: {
                                        storeId: store._id,
                                        submitted: true
                                    }
                                }, { $unwind: "$formSnapshots" }, { $unwind: "$formSnapshots.questionGroupData" },
                                {
                                    $group: {
                                        _id: "$formSnapshots.questionGroupData.groupType",
                                        totalValue: { $sum: "$formSnapshots.questionGroupData.value" },
                                        count: { $sum: 1 }

                                    }
                                },
                                {
                                    $lookup: {
                                        from: "grouptypes",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "groupType"
                                    }
                                },
                                {
                                    $unwind: {
                                        "path": "$groupType",
                                        "preserveNullAndEmptyArrays": true
                                    }
                                },
                                {
                                    $project: {
                                        type: "$groupType.name",
                                        groupId: "$groupType._id",
                                        percentage: {
                                            $multiply: [{ $divide: ["$totalValue", { $multiply: ["$count", 100] }] }, 100]
                                        }
                                    }

                                }

                            ],
                            function(err, docs) {
                                if (err) {
                                    res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                                } else {
                                    var groupData = [];
                                    _.each([config.amenities, config.integrity, config.qualityOfWork, config.customersServices], function(grp) {
                                        var grpData = _.find(docs, function(obj) { return obj.groupId + "" == grp + "" });
                                        if (!grpData) {
                                            var type = grp === config.amenities ? "AMENITIES" : grp === config.integrity ? "INTEGRITY" : grp === config.qualityOfWork ? "QUALITY OF WORK" : grp === config.customersServices ? "CUSTOMER SERVICE" : "";
                                            groupData.push({ type: type, percentage: 0, store: { recommendedScore: 0, overallRating: 0 } })
                                        } else {
                                            groupData.push(grpData)
                                        }

                                    })
                                    groupData.sort();
                                    i++;
                                    store.groupData = JSON.parse(JSON.stringify(groupData));
                                    if (i === stores.length) {
                                        res.status(200).json({ status: "success", message: "Infolytics generated successfully", html: getHtml(req, stores) });
                                    }
                                    nextStore(store[i])

                                }

                            })
                    })

                } else {
                    res.status(200).json({ status: "error", message: "data not found" });

                }



            })


    }
}

module.exports = compare;


function getHtml(req, data) {
    // <!-- Start: Top Items -->
    var mainHtml = "";
    mainHtml += "<div class='row company-all clearfix'>";
    _.each(data, function(store) {
        mainHtml += getTop(store);
    })
    if (data.length < 4) {
        mainHtml += "<div class='col-md-3'><a href='" + (config.BASE_URL + (req.session.userCity && req.session.userCity.name)) + "/stores" + "?city=" + (req.session.userCity && req.session.userCity.cityId) + "' class='addtocompare-btn'><img src='img/car-ico.png' alt=''><br><span>Add to compare</span></a></div>";
    }
    mainHtml += "</div>";

    mainHtml += "<div class='compare-rating'>";
    mainHtml += "<div class='compare-titles'><i class='fa fa-star' aria-hidden='true'></i><h5>Customer rating</h5></div>";
    mainHtml += "<div class='compare-conts'>";
    mainHtml += "<ul class='compare-devisions clearfix'>";
    _.each(data, function(store) {
        // <!-- Start: First Section -->
        mainHtml += getCustExp(store)
    })
    mainHtml += "</ul></div></div>";
    // <!-- Start: Customer Overview -->
    mainHtml += "<div class='compare-overview'>";
    mainHtml += "<div class='compare-titles'><i class='fa fa-info-circle' aria-hidden='true'></i><h5>Overview</h5></div>";
    mainHtml += "<div class='compare-conts'>";
    mainHtml += "<ul class='compare-devisions clearfix'>";

    // <!-- Start: First Section -->
    _.each(data, function(store) {
        mainHtml += getContact(store)
    })
    // <!-- End: First Section -->
    mainHtml += "</ul>";
    mainHtml += "</div>"
    mainHtml += "</div>";
    // // <!-- End: Customer Overview -->

    // // <!-- Start: Customer Offers -->
    mainHtml += "<div class='compare-offers'>"
    mainHtml += "<div class='compare-titles'><img class='img-ico' src='img/tag-ico.png' alt=''><h5>Offers</h5></div>"
    mainHtml += "<div class='compare-conts'>";
    mainHtml += "<ul class='compare-devisions clearfix'>";

    // <!-- Start: First Section -->
    _.each(data, function(store) {
        mainHtml += getOffers(store)
    })
    // <!-- End: First Section -->
    mainHtml += "</ul>"
    mainHtml += "</div>"
    mainHtml += "</div>"

    // <!-- Start: Customer Best Experiences -->
    mainHtml += "<div class='compare-best'>";
    mainHtml += "<div class='compare-titles'><img class='img-ico' src='img/best-ico.png' alt=''>Top best experiences</h5></div>";
    mainHtml += "<div class='compare-conts'>";
    mainHtml += "<ul class='compare-devisions clearfix'>";

    // <!-- Start: First Section -->
    _.each(data, function(store) {
        mainHtml += getBets(store, req)
    })
    // <!-- End: First Section -->
    mainHtml += "</ul>";
    mainHtml += "</div>"
    mainHtml += "</div>";
    // <!-- End: Customer Best Experiences -->

    // // <!-- Start: Customer Worst Experiences -->
    mainHtml += "<div class='compare-worst'>";
    mainHtml += "<div class='compare-titles'><img class='img-ico' src='img/sad-ico.png' alt=''><h5>Top worst experiences</h5></div>";
    mainHtml += "<div class='compare-conts'>";
    mainHtml += "<ul class='compare-devisions clearfix'>";

    _.each(data, function(store) {
        mainHtml += getworst(store, req)
    })

    mainHtml += "</ul>";
    mainHtml += "</div>"
    mainHtml += "</div>";
    // <!-- End: Customer Worst Experiences -->
    return mainHtml;

}

function getTop(store) {
    console.log(store.name)
    var html = "<div class='col-md-3'>";
    html += "<div class='company-single'>";
    var id = '"' + store._id + '"';
    html += "<a href='javascript:;' class='close-btn' onclick='removeStore(" + id + ")'><img src='img/close-ico.png' alt=''></a>";
    html += "<img onerror=this.src='" + (config.BASE_URL + 'img/car-ico.png') + "' src='" + (config.BASE_URL + store.logo) + "' alt=''>";
    html += "<h5>" + (store.name) + "</h5>";
    html += "<p>Make: <span>" + (store.make && store.make.name ? store.make.name : "") + "</span></p>";
    html += "<div class='arrow-down'></div>";
    html += "</div>";
    html += "</div>";
    return html;
}

function getCustExp(store) {
    var rating = "<li>";
    rating += "<div class='custrating-single'>";
    rating += "<div class='meeter-cont'>";
    rating += "<div class='meter-all'>";
    rating += "<div class='meter-main'>";
    rating += "<div class='meter-dial-pointer'></div>";
    var imgName = 0;
    for (var j = 10; j <= Math.round(store.recommendedScore); j = j + 10) {
        imgName++;
        if (j < Math.round(store.recommendedScore) && Math.round(store.recommendedScore) < (j + 10)) {
            imgName++;
            break;
        }

    }
    var img = config.BASE_URL + "img/spedometer/meter_bar_" + (imgName < 3 ? 'red' : (imgName >= 3 && imgName < 7) ? 'yellow' : 'green') + "_" + imgName + ".png";
    if (imgName == 0) {
        img = config.BASE_URL + "img/spedometer/meter_bar_0.png";
    }
    rating += "<img src='" + (img) + "' class='meter-dial' alt=''>";
    rating += "</div>";
    rating += "<div class='mtr-reccomented'><span>" + Math.round(store.recommendedScore) + "<i> %</i></span>recommended</div>";
    rating += "<div class='mtr-rating'>Rating";
    rating += "<ul class='mt-ratings'>";
    for (var i = 0; i < 5; i++) {
        if (i < Math.round(store.overallRating)) {
            rating += "<li class='active'><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
        } else {
            rating += "<li><a href='#'><i class='fa fa-star' aria-hidden='true'></i></a></li>";
        }
    }
    rating += "</ul>";
    rating += "</div>";
    rating += "</div>";
    rating += "</div>";
    rating += "<div class='rate-detail'>";
    rating += "<ul class='rate-list clearfix'>";
    _.each(store.groupData, function(group) {
        rating += "<li>";
        rating += "<div class='rate-list-detail clearfix'>";
        rating += "<div class='title'>" + group.type + "</div>";
        rating += "<div class='percentage'>" + Math.round(group.percentage) + "% </div>";
        var progress = group.type == "AMENITIES" ? 'progress green' : group.type == "INTEGRITY" ? 'progress yellow' : group.type == "QUALITY OF WORK" ? 'progress red' : group.type == "CUSTOMER SERVICE" ? 'progress blue' : '';
        rating += "<div class='progress-vis'>";
        rating += "<div class='" + progress + "'>";
        rating += "<div class='progress-bar' role='progressbar' aria-valuenow='" + Math.round(group.percentage) + "' aria-valuemin='0' aria-valuemax='100' style='width:" + Math.round(group.percentage) + "%;'></div>";
        rating += "</div>";
        rating += "</div>";
        rating += "</div>";
        rating += "</li>";
    })

    rating += "</ul>";
    rating += "</div>";
    rating += "</div>";
    rating += "</li>";

    return rating;
}

function getContact(store) {
    var working = _.groupBy(store.workingHours, function(hour) { return (hour.start && hour.end && hour.closed == false) });
    var workingData;
    var contact = "<li>";
    contact += "<div class='custoverview-single'>";
    contact += "<p><span><i class='fa fa-phone' aria-hidden='true'></i> Phone</span>" + (store.phone ? store.phone : 'Not available') + "</p>";
    contact += "<p><span><i class='fa fa-map-marker' aria-hidden='true'></i> Address</span>" + (store.address ? store.address : 'Not mentioned') + "</p>";
    contact += "<p><span><i class='fa fa-envelope' aria-hidden='true'></i> Email</span>" + (store.email ? store.email : 'Not mentioned') + "</p>";

    console.log("working**********", working)
    _.each(working, function(value, key) {
        //console.log("value:#############",value);
        console.log("key:#############", key);
        console.log("value.length$$$$$$$", value.length);

        if (value.length > 0) {
            if (key + "" == true + "") {
                console.log("in true function");

                workingData = "" + value[0].day + "-" + value[value.length - 1].day + " :" + value[0].start + ":00-" + value[value.length - 1].end + ":00,<br>";
            }
            if ((key == 0 + "") && (key + "" != true + "")) {
                console.log("in not mentioned function");
                workingData = "Not mentioned";

            }




        }
    })
    contact += "<p><span><i class='fa fa-clock-o' aria-hidden='true'></i> working hours</span>";
    contact += workingData ? workingData : "Not mentioned";
    contact += "</p>";
    contact += "</div>";
    contact += "</li>";
    return contact;
}

function getOffers(store) {
    var offer = ""
    var offers = (store.make && store.make.offers && store.make.offers.length > 0) ? store.make.offers : [];
    if (offers.length > 0) {
        offer += "<li>";
        offer += "<div class='custoffer-single'>";
        _.each(store.make.offers, function(offer1) {
            offer += "<div id='content'><a href='#' class='linkify'><span class='col-btn'>Offer</span><br>" + (offer1.shortDescription && offer1.shortDescription) + "</a></div>";
        })
        if (store.make.offers.length === 0) {
            offer += "<div class='no-item'><img src='img/no-item-ico.png' alt=''><p>Unfortunately<br>" + store.name + "<br>has no offers yet.</p></div>";
        }
        offer += "</div>";
        offer += "</li>";
    } else {
        offer += "<li>";
        offer += "<div class='custoffer-single'>";
        offer += "<div class='no-item'><img src='img/no-item-ico.png' alt=''><p>Unfortunately<br>" + store.name + "<br>has no offers yet.</p></div>";
        offer += "</div>";
        offer += "</li>";
    }
    return offer;
}

function getBets(store, req) {
    var best = "<li><div class='custbestworst-single'>";
    // <!-- Start: Item 01 -->
    var isposts = false;
    store.bests = store.bests.length > 0 ? store.bests.splice(0, 3) : [];
    _.each(store.bests, function(best1) {
        if (!_.isEmpty(best1)&&best1.exp.posts) {
            console.log("~~~~~ best1", best1);
            // best1.exp.posts = best1.exp.posts.filter(function(post) { return post.rating >= 4 })
            // best1.exp.posts = best1.exp.posts.sort(function(post1, post2) { return post1.rating <= post2.rating })

            best += "<div class='cont-peruser'>";
            best += "<p  class='exp-title linkify' ><span class='ratings good'>" + (best1.exp.posts ? Math.round(best1.exp.posts.rating || 0) : 0) + "<i class='fa fa-star' aria-hidden='true'></i></span> <a href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (store.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(best1.exp.posts.title) + '?experience=' + best1.exp.experienceId) + "' style='color:#333333' class='text-hover-green' target='_blank'>" + (best1.exp.posts && best1.exp.posts.title || "") + "</a></p>";

            best += "<div class='user-details clearfix'>";
            best += "<span class='profile-img'><img onerror=this.src='" + (config.BASE_URL + 'img/user-demo.png') + "'  src='" + (config.BASE_URL + (best1.user && best1.user.anonymous ? best1.user.avatarImage : (best1.user ? best1.user.profileImage : ''))) + "' alt=''> <a class='text-hover-green' href='" + (BASE_URL + 'profile/' + (best1.user && best1.user.userId)) + "'>" + (best1.user && best1.user.anonymous ? best1.user.displayName : (best1.user ? best1.user.name : 'Unknown')) + "</a></span></div>";
            best += "</div>";
            isposts = true;


        }
    })
    if (!isposts) {
        best += "<div class='no-item'><img src='img/no-item-ico.png' alt=''><p>" + store.name + "<br>has no best experiences yet.</p></div>";
    }
    // <!-- End: Item 01 -->

    best += "</div>"
    best += "</li>";

    return best;


}

function getworst(store, req) {
    var best = "<li><div class='custbestworst-single'>";
    // <!-- Start: Item 01 -->
    console.log('store.worst', store.worst)
    store.worst = store.worst.length > 0 ? store.worst.splice(0, 3) : [];

    var isposts = false;
    _.each(store.worst, function(worst) {
        if (!_.isEmpty(worst)&&worst.exp.posts) {
            // worst.exp.posts = worst.exp.posts.filter(function(post) { return post.rating <= 2 })
            // worst.exp.posts = worst.exp.posts.sort(function(post1, post2) { return post1.rating <= post2.rating })

            best += "<div class='cont-peruser'>";
            best += "<p class='exp-title linkify'><span class='ratings'>" + (worst.exp.posts ? Math.round(worst.exp.posts.rating || 0) : 0) + "<i class='fa fa-star' aria-hidden='true'></i></span><a href='" + (config.BASE_URL + businessHelper.changeToVanityurl(req.session.userCity && req.session.userCity.name || '-') + '/' + (store.vanityUrl || '-') + '/experiences/' + businessHelper.changeToVanityurl(worst.exp.posts.title) + '?experience=' + worst.exp.experienceId) + "' style='color:#333333' class='text-hover-green' target='_blank'>" + (worst.exp.posts && worst.exp.posts.title || '') + "</a></p>";
            best += "<div class='user-details clearfix'>";
            best += "<span class='profile-img'><img onerror=this.src='" + (config.BASE_URL + 'img/user-demo.png') + "' src='" + (config.BASE_URL + (worst.user && worst.user.anonymous ? worst.user.avatarImage : (worst.user ? worst.user.profileImage : ''))) + "' alt=''> <a class='text-hover-green' href='" + (BASE_URL + 'profile/' + (worst.user && worst.user.userId)) + "'>" + (worst.user && worst.user.anonymous ? worst.user.displayName : (worst.user ? worst.user.name : 'Unknown')) + "</a></span></div>";
            best += "</div>";
            isposts = true;

        }
    })
    // <!-- End: Item 01 -->
    if (!isposts) {
        best += "<div class='no-item'><img src='img/no-item-ico.png' alt=''><p><br>" + store.name + "<br>has no worst experiences yet.</p></div>";
    }
    best += "</div>"
    best += "</li>";
    return best;


}