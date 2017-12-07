var express = require('express');
var router = express.Router();
var home = require('./admin/controllers/home.js')
var systemConfig = require('./admin/controllers/systemConfig.js')

var cities = require('./admin/controllers/cities.js')

var makes = require('./admin/controllers/makes.js')
var forms = require('./admin/controllers/forms.js')
var groupType=require('./admin/controllers/groupType.js')
var questions = require('./admin/controllers/questions.js')
var faqs = require('./admin/controllers/faqs.js')
var admin = require('./admin/controllers/admins.js')
var stores = require('./admin/controllers/stores.js')
var carModels = require('./admin/controllers/carModels.js')
var masters = require('./admin/controllers/masters.js')
var pages = require('./admin/controllers/pages.js')
var users = require('./admin/controllers/users.js')
var experience = require('./admin/controllers/experience.js')

var importLogs= require('./admin/controllers/importLogs.js')



var config = require('./config/adminConfig.js');

var multer = require('multer');
var upload = multer({ dest: 'temp/', limits: { fileSize: 32 * 1024 * 1024 } });

/***********Routes**************/

router.get('/demo', home.demo);

/********************* forgot Password **********************/
router.post('/sendForgotLink', home.sendForgotLink);
router.post('/setPassword/:id', home.setPassword);
router.get('/secure/links/:id', home.getOne);
/********************* change password **********************/
router.put('/changePassword', home.changePassword);

/********************* System Config**********************/

router.put('/updateConfig/:id', systemConfig.updateConfig);

/*******************************************/
router.post('/login', home.login);
router.post('/save', home.create);
router.get('/getConfig', systemConfig.getAll);

router.post('/addconfig', systemConfig.addConfig);
router.post('/addCity', cities.addCity);
router.get('/getAllCities', cities.getAllCities);

router.post('/adminUser', admin.addAdmin);
router.put('/adminUser/:adminId', admin.updateAdmin);
router.delete('/adminUser/:adminId', admin.deleteAdmin);
router.get('/adminUser/:adminId', admin.getOneAdmin);
router.get('/adminUsers', admin.getAllAdmin);
router.put('/setPassword/:adminId', admin.setPassword);
/********************* store **********************/
router.post('/store', upload.single('file'), stores.addStore);
router.put('/store/:storeId', upload.single('file'), stores.updateStore);
router.delete('/store/:storeId', stores.deleteStore);
router.get('/store/:storeId', stores.getOneStore);
router.get('/stores', stores.getAlltSores);
/********************* Featured store **********************/
router.get('/featuredstores', cities.getAllStores);
router.get('/searchcity', cities.searchCity);
router.get('/searchstore', stores.searchStore);
router.get('/searchexperience', experience.searchexperience);
router.put('/addFeaturedStore/:cityId', cities.saveFeaturedStore);
router.delete('/deletefeaturedstores/:cityId/:storeId', cities.removeFeaturedStore);
router.put('/addFeaturedExperiences/:cityId', cities.saveFeaturedExperiences);
router.get('/featuredexperiences', cities.getAllExperiences);
router.delete('/deletefeaturedexperience/:cityId/:expId', cities.removeFeaturedExperience);



router.post('/carModel', carModels.addCarModel);
router.put('/carModel/:carModelId', carModels.updateCarModel);
router.delete('/carModel/:carModelId', carModels.deleteCarModel);
router.get('/carModel/:carModelId', carModels.getOneCarModel);
router.get('/carModels', carModels.getAllCarModels);

/********************* Makes **********************/
router.post('/addMake', upload.any(), makes.create);
router.post('/uploadOffer', upload.any(), makes.uploadOffer);
router.get('/makes', makes.getAll);
router.delete('/make/:id', makes.delete);
router.get('/make/:id', makes.getOne);

router.post('/createAndUpdateFaq', faqs.create);
router.get('/getFAQs', faqs.getAll);
router.get('/getOnefaq/:id', faqs.getOne);
router.delete('/removeFAQ/:id', faqs.remove);

/********************* Forms **********************/
router.post('/form', forms.create);
router.get('/forms', forms.getAll);
router.get('/form/:id', forms.getOne);
router.delete('/form/:id', forms.delete);

/**********************Group Type****************************/

router.post('/groupType', groupType.addGroupType);
router.put('/groupType/:typeId', groupType.updateGroupType);
router.put('/changeTypeStatus/:typeId', groupType.updateStatus);
router.delete('/groupType/:typeId', groupType.deleteGroupType);
router.get('/activeGroupType', groupType.getAllActiveGroupType);
router.get('/groupType', groupType.getAllGroupType);



/********************* Questions **********************/
router.get('/questions', questions.getAll);
router.get('/searchQuestion', questions.searchQuestion);
router.post('/addQuestion', questions.create);
router.put('/updateQuestion/:queId', questions.updateQuestion);
router.put('/removeQuestion/:queId', questions.remove);
//router.delete('/removeQuestion/:queId', questions.remove);
router.post('/getConfigByKey', systemConfig.getConfigByKey);


/********************* city **********************/
router.post('/addCity', cities.addCity);
router.post('/addCities',upload.single('file'), cities.addMultiCities);
router.get('/getCities', cities.getAllCities);
router.put('/getCity/:cityId', cities.getCity);
router.put('/updateCity/:cityId', cities.updateCity);
router.delete('/deleteCity/:cityId', cities.remove);
router.get('/getCountry',importLogs.getCountry);
router.post('/createCountry',importLogs.create);
router.put('/importNow',importLogs.importNow);
/********************* Master **********************/
router.post('/addMsater', masters.addMsater);
router.put('/updateMsater/:masterId', masters.updateMsater);
router.get('/getAllMasters', masters.getAll);
router.get('/getMastersByKey/:key', masters.getMastersByKey);
router.get('/getMastersByKeys', masters.getMastersByKeys);

router.delete('/deleteMasterKey/:masterId', masters.deleteMasterKey);

/********************* Pages **********************/

router.post('/getPageContents', pages.getPageContents);
router.put('/updatePageContents', pages.updatePageContents);

/********************* Users **********************/
router.get('/users', users.getAll);
router.put('/updateUserStatus/:userId', users.updateUserStatus);
router.post('/warneduser/:userId',users.warneduser);
router.get('/newsletterusers',users.newsletterusers);
router.get('/getExcel',users.getExcel);
/********************* Experience **********************/
router.get('/experiences', experience.getAll);
router.get('/experience/:experienceId', experience.getOne);
router.delete('/experience/:experienceId', experience.deleteExperience);
router.put('/bannUser/:userId', experience.bannUser);
router.put('/isFeatured/:expId', experience.isFeatured);
router.put('/removePost/:expId/:postId', experience.removePost);
router.put('/removeComment/:expId', experience.removeComment);

router.put('/comment/:expId', experience.comment);
router.put('/post/:expId', experience.post);
module.exports = router;