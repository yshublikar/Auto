var config = {
    // port: 8080,
    port: 8100,
    // BASE_URL: 'http://brandlabel.net/',
    BASE_URL: 'http://bl.amdev.in/',
    // BASE_URL: 'http://localhost:8080/',

    // Database Credentials
    /*mongo: {
        hostname: "localhost",
        port: "27017",
        username: "",
        password: "",
        db: "brandlabeldb"
    },
*/

    //Database Credentials
    mongo: {
        hostname: "162.243.50.101",
        port: "38086",
        username: "brandlabel_db_user",
        password: "brandlabel@1234",
        // db:"brandlabel_db",
        db: "brandLabel_stage"
    },


    //Email Credentials
    sendgrid: {

       username: 'sanjay_am',
       password: 'Angular556'

    },

    // Email headers
    headers: {
        to: ["sanjay@angularminds.com"],
        toname: ["Admin"],
        from: "brandlabeltester@gmail.com",
        cc: "",
        bcc: "",
        mobileNumber: "+919860916736"
    },



    // SMS Credentials
    /*twilio: {
        accountSid: 'AC87a76ba44c75fdb2a7590a235bf2e4a3',
        authToken: '45bb16ea5b4b23904aae5126360d8baa'
    },
*/
    MAP_API_KEY: "AIzaSyBnFwrCdwnjyNrFuPV_IXP31CkcW_6hPjE",

    fourSquare: {
        url: "https://api.foursquare.com/v2/",
        client_id: "ZUEHLV00KINL0AA1OZCUT5PXW45MUEEIDEJDZVOM4ZHUWLP3",
        client_secret: "NZBXBYNTNVRNJ2R42DYYGLEHMRPV304RQCKEHNRYOZZZL5FZ",
        categoryId: "4eb1c1623b7b52c0e1adc2ec,56aa371be4b08b9a8d5734d3",
        v: "20170830"
    },

    //quetion groupId
    amenities: "59e1eff653f44a0f2246425e",
    integrity: "59d5eb3951ab2312ac05facc",
    qualityOfWork: "59d5f2aa0ca4790c6cd8dc5d",
    customersServices: "59d5f2bd0ca4790c6cd8dc5e",
};

// config.mongo.url = 'mongodb://' + config.mongo.username + ":" + config.mongo.password + "@" + config.mongo.hostname + ':' + config.mongo.port + '/' + config.mongo.db;
config.mongo.url = 'mongodb://' + config.mongo.hostname + ':' + config.mongo.port + '/' + config.mongo.db;

module.exports = config;
