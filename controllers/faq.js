var businessHelper = require('../helpers/businessHelper');
var faqModel = require('../models/faq');
var ObjectId = require('mongodb').ObjectID;
var config = require('../config/config.js');
var faqModel = require('../models/faq.js');
var masterModel = require('../models/master.js');
var _ = require('underscore');


var faq = {

    default: function(req, res) {

        faqModel.aggregate([{
                    $lookup: {
                        from: "masters",
                        localField: "section",
                        foreignField: "_id",
                        as: "section"
                    }
                }, {
                    $lookup: {
                        from: "masters",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: {
                        "path": "$category",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        "path": "$section",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $group: {
                        _id: { section: "$section.masterValue", category: "$category.masterValue" },
                        data: {
                            $addToSet: {
                                title: "$title",
                                description: "$description",
                                featured: "$featured"
                            }
                        }
                    }
                },

                {
                    $project: {
                        section: "$_id.section",
                        category: "$_id.category",
                        questions: "$data"
                    }
                }
            ],
            function(err, docs) {
                if (err) {

                } else if (docs.length > 0) {
                    masterModel.find({ masterKey: { $in: ["FAQ_Sections", "FAQ_Categories"] } }, function(err, masters) {
                        if (err) {

                        } else {
                            var sections = _.filter(masters, { masterKey: "FAQ_Sections" });
                            var category = _.filter(masters, { masterKey: "FAQ_Categories" });

                            var formattedData = [];
                            _.each(sections, function(section) {
                                var obj = { _id: section.masterId, section: section.masterValue, categories: [] }
                                _.each(category, function(cat) {
                                    var ques = _.findWhere(docs, { section: section.masterValue, category: cat.masterValue })
                                    obj.categories.push({ category: cat.masterValue, _id: cat.masterId, questions: (ques && ques.questions || []) })
                                })
                                formattedData.push(obj)

                            })

                            //res.status(200).json({ status: "success", message: "Offer gets Successfully", formattedData: docs })
                            res.render('faq.html', { data: { title: 'FAQ | Brand Label', userDetails: req.session.userModel, formattedData: formattedData, city: req.session.userCity } });
                        }
                    })

                } else {
                    res.render('faq.html', { data: { title: 'Brand Label', userDetails: req.session.userModel, formattedData: [], city: req.session.userCity } });
                }

            })
    },
    getQuestionsByCategory: function(req, res) {
        faqModel.find()
            .populate({ path: 'section', match: { masterId: req.params.sectionId } })
            .populate({ path: 'category', match: { masterId: req.params.categoryId } })
            .exec(function(err, docs) {
                docs = docs.filter(function(doc) {
                    return doc.section && doc.category;
                });
                if (!err && docs) {
                    data = {
                        page: 'faq-show-all',
                        title: 'Brand Label',
                        questions: docs,
                        categoryName: docs[0].category.masterValue,
                        userDetails: req.session.userModel,
                        city: req.session.userCity
                    }
                    //res.status(200).json({ status: "success", message: "Offer gets Successfully", formattedData: docs })
                    res.render('faq-show-all.html', { data: data });
                }
            })
    },

    getFAQs: function(req, res) {

        if (req.query.q != undefined && req.query.q != "") {
            faqModel.find({ title: { $regex: req.query.q, $options: "i" } }).populate('category').populate('section').exec(function(err, docs) {
                if (!err && docs) {
                    res.status(200).json({ status: "success", message: "Data retrived successfully", docs: docs })
                }
            })
        }
    },

    searchPage: function(req, res) {

        if (req.query.search != undefined && req.query.search != "") {
            res.render('faq-result.html', { data: { title: 'Brand Label', searchKey: req.query.search, userDetails: req.session.userModel, city: req.session.userCity } });
        }
    },

    getOne: function(req, res) {
        if (req.params.sectionId != undefined && req.params.categoryId != undefined && req.params.faqId != undefined) {
            faqModel.find({ faqId: req.params.faqId })
                .populate({ path: 'section', match: { masterId: req.params.sectionId } })
                .populate({ path: 'category', match: { masterId: req.params.categoryId } })
                .exec(function(err, docs) {
                    docs = docs.filter(function(doc) {
                        return doc.section && doc.category;
                    });
                    if (!err && docs) {
                        res.render('faq-answer.html', { data: { title: 'Brand Label', userDetails: req.session.userModel, faqData: docs, city: req.session.userCity } });
                    }
                })
        }
    },

    getFAQsBySearch: function(req, res) {
        console.log("inside here!!!!!!!!!!!!!!!!!!!!!")
        var skip = req.query.skip ? parseInt(req.query.skip) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 5;
        var startFrom = req.query.startFrom ? parseInt(req.query.startFrom) : 1;
        var searchKey = req.query.search;

        if (searchKey != undefined) {

            faqModel.count({ title: { $regex: searchKey, $options: "i" } }, function(err, faqCount) {

                faqModel.find({ title: { $regex: searchKey, $options: "i" } }).skip(skip).limit(limit).exec(function(err, docs) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while getting experiences " + err });
                    } else if (docs.length > 0) {
                        console.log("docs", docs.length)

                        //var html = "";
                        // _.each(docs, function(item) {
                        var html = getHtml(docs, searchKey, faqCount, limit);
                        //});
                        res.status(200).json({ status: "success", message: "Html generated", html: html, pagination: getPagination(faqCount, limit, skip, startFrom, searchKey) });

                    } else {
                        html = '<div class="help-title clearfix">\
                                    <h3>No results found for "' + searchKey + '"</h3>\
                                </div>\
                                <hr>\
                                <div class="help-result">\
                                    <div class="no-result"><p>No results for "' + searchKey + '". <a href="' + BASE_URL + 'faq">Browse help center</a></p></div>\
                                </div>'

                        res.status(200).json({ status: "success", message: "Experineces not found", html: html, pagination: '' });

                    }

                })

            })
        }
    }
}

module.exports = faq;

function getHtml(data, searchKey, count, recordCount) {
    var html = '<div class="help-title clearfix">\
                <h3>' + count + ' results found for "' + searchKey + '"</h3>\
                </div>\
                <hr class="result">\
                <div class="help-result">\
                    <ul class="have-result">';
    data.forEach(function(item) {
        if (recordCount < count) {
            html += '<li><h6><a href="javascript:;">' + item.title + '</a></h6><p>' + item.description + '</p></li>';
        } else {
            html += '<li style="border-bottom:none"><h6><a href="javascript:;">' + item.title + '</a></h6><p>' + item.description + '</p></li>';
        }
    })

    html += '</ul></div>';

    return html;
};

function getPagination(count, limit, skip, startFrom, searchKey) {
    if (count < limit) {
        return "";
    }
    searchKey = "'" + searchKey + "'";
    var pageNo = "";
    if (skip > 0) {
        pageNo = "<li class='go-prev' onclick='prevPage(" + limit + ")'><a href='javascript:;'><i class='fa fa-angle-left' aria-hidden='true'></i></a></li>";
    }
    var skip1 = 0;
    var mid = (count / limit);
    mid = mid + "";
    if (mid.indexOf('.') > -1) {
        mid = parseInt(mid) + 1;
    }
    var isMore = false;
    var isLess = false;

    for (var i = startFrom; i <= mid; i++) {
        if (startFrom > 10) {
            if (!isLess) {
                pageNo += "<li id=" + i + " onclick='less(" + skip1 + "," + limit + "," + i + ")' class='dotted'><a href='#''>...</a></li>"
                isLess = true;
            }

        }
        if (i >= startFrom + 10) {
            if (!isMore) {
                pageNo += "<li id=" + i + " onclick='more(" + skip1 + "," + limit + "," + i + ")' class='dotted'><a href='#''>...</a></li>"
                isMore = true;
            }

        } else if (i <= startFrom + 10) {
            pageNo += '<li id=' + i + ' onclick="getQuestions(' + skip1 + ',' + limit + ',' + i + ',' + startFrom + ',' + searchKey + ')"><a href="javascript:;">' + i + '</a></li>'

        }

        skip1 += limit;
    }
    if ((skip + limit) < count) {
        pageNo += "<li id=" + i + " class='go-next' onclick='nextPage(" + limit + ")'><a href='javascript:;'><i class='fa fa-angle-right' aria-hidden='true'></i></a></li>";
    }
    return pageNo;

}