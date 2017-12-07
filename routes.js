var express = require('express');
var router = express.Router();
var home = require('./controllers/home.js')
var store = require('./controllers/store.js')
var experience = require('./controllers/experience.js')
var profile = require('./controllers/profile.js')
var compare = require('./controllers/compare.js')
var contact = require('./controllers/contact.js')
var aboutUs = require('./controllers/aboutUs.js')
var privacy = require('./controllers/privacy.js')
var faq = require('./controllers/faq.js')
var city = require('./controllers/city.js')
var user = require('./controllers/userLogin.js')
var fourSquare = require('./controllers/fourSquare/fourSquare.js');
var validations = require('./middlewares/validateData.js');
var makes = require('./controllers/makes.js')
var cron = require('node-cron');
var vin = require('./controllers/vin.js')
var multer = require('multer');
var upload = multer({ dest: 'temp/', limits: { fileSize: 32 * 1024 * 1024 } });

/***********Routes**************/


/***********Routes Pages***********/
router.get('/', home.getIndex);
router.get('/store-listing', store.listing);

router.get('/getOffer/:makeId/:offerId', store.getOffer);
router.post('/getStoresByIds', store.getStoresByIds);

//router.get('/create-experience', experience.default);
router.post('/create-experience', experience.create);
router.get('/create-experience/step1', experience.step1);
router.get('/create-experience/step2/:id', experience.step2);
router.post('/create-experience/save', experience.save);
router.get('/create-experience/step3/:experienceId', experience.step3);

router.get('/profile/:userId', profile.default);
router.get('/compare', compare.default);
router.get('/contact', contact.default);
router.get('/about-us', aboutUs.default);
router.get('/privacy-policy', privacy.default);
router.get('/faq', faq.default);
router.get('/faq/:sectionId/:categoryId', faq.getQuestionsByCategory);
router.get('/faq/:sectionId/:categoryId/:faqId', faq.getOne);
router.get('/getFAQs', faq.getFAQs)
router.get('/faq/searchPage', faq.searchPage)
router.get('/faq/search', faq.getFAQsBySearch)

router.get('/demo', home.demo);
router.get('/createStore', home.createStore);
router.get('/search', home.search);
router.post('/setCity', home.setCity);



// router.get('/stores/:storeType/:city', store.getAllByMake); 	// Stores by makes
// router.get('/stores/:name/:storeType/:city', store.getAllByMake); // Stores by makes
router.get('/:city/stores', store.searchByCity);
// router.get('/stores/:storeType/:city', store.getStoresByCity);
router.get('/getMakes', makes.getMakes);

// router.post('/searchStoresByCity', store.searchByCity);
router.post('/getFilteredStores', store.getFilteredStores); // featured stores
router.get('/getStoreExperinces/:storeId', store.getStoreExperinces);
router.post('/addStore', store.addStore);

router.get('/featuredExperiences/:cityId', home.getFeaturedExperiences); // featured stores

/***********Static Pages***********/

/***********AJAX APIs**************/

router.get('/getCities', city.getLimited);
router.get('/getStores/:city', store.getStores);
router.get('/getForms', experience.getForms);
router.get('/getCarModel', experience.getCarModel);
router.post('/login', user.createUser);
router.get('/logout', user.logout);

router.get('/getStoreInfolytics/:storeId', store.getStoreInfolytics);
router.get('/getComparedStores', compare.getComparedStores);
router.get('/getGraphData/:storeId', store.getGraphData);
router.get('/trackExperienceVisitCount/:experienceId/:userId', experience.trackExperienceVisitCount);
router.get('/trackStoreVisitCount/:storeId/:userId', store.trackStoreVisitCount);
router.get('/trackProfileVisitCount/:user_id', profile.trackProfileVisitCount);





// Others
router.post('/getModal', home.getModal);

//update profile
router.post('/update/profile', profile.update);
router.post('/update/settings', profile.updateSettings);
router.post('/update/loginUserDetails', profile.loginDetails);

router.get('/getUserActivity/:userId', profile.getUserActivity);


//contact 
router.post('/informAdmin', contact.informAdmin);

//Experience-details
router.put('/LikeOrFlag/:expId', experience.LikeOrFlag);
router.put('/saveComment/:expId', experience.saveComment);
router.put('/updateCommentAndPost/:expId', experience.updateCommentAndPost);
router.put('/addPost/:expId', experience.addPost);
router.put('/closeSotry/:expId', experience.closeSotry);
///new routes By Keshav
// router.get('/experience-details/:experienceId', experience.details);
router.get('/:city/:store/experiences/:title', experience.details);


// Without static name parameter routes -----------
router.get('/store/:vanityUrl/:storeId', store.details);

// router.get('/store/:city/:vanityUrl/:storeId', store.details);
router.get('/:city/:vanityUrl', store.details);
//router.get('/vin/:vin', vin.getVIN);




///***************** Cron Job. ***********************///

// Fours Square API
router.get('/createAndUpdateStores', fourSquare.createAndUpdateStores);
router.get('/getImportCountries', fourSquare.getImportCountries);


cron.schedule('*/10 * * * *', fourSquare.createAndUpdateStores);

cron.schedule('0 */1 * * *', fourSquare.getImportCountries);

module.exports = router;