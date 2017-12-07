var _ = require('underscore');
var fs = require("fs");

var pages = {


    getPageContents: function(req, res) {
        console.log("req.body--------",req.body);
        fs.readFile(req.body.path, 'utf8', function (err,data) {
          if (err) {
            res.status(500).json({ status: 'error', message: "Cannot read Contents", doc: "" });
          }
          console.log(data);
           res.status(200).json({ status: 'success', message: " Successfully get Contents.", doc: data });
        });
    },
    updatePageContents: function(req, res) {
        console.log("req.body from update--------",req.body);
       fs.writeFile(req.body.path, req.body.contents, function (err,data) {
          if (err) {
            console.log("error: ",err);
            res.status(500).json({ status: 'error', message: "Cannot read Contents", doc: "" });
          }
          //console.log("data: ",data);
           res.status(200).json({ status: 'success', message: " Successfully updated Contents.", doc: "" });
        });
    }

   
}

module.exports = pages;