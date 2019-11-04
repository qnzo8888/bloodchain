var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
const { User } = require('../models');

/* GET home page. */
router.get('/', async function(req, res, next) {
  var companys = await User.findAll({
    where: {flag: true},
    order: [['dona_count', 'DESC']],
    limit: 5
  })

  var persons = await User.findAll({
    where: {flag: false},
    order: [['dona_count', 'DESC']],
    limit: 5
  })

  var result = {companys: companys, persons: persons};

  if(req.user == undefined)
    res.render('main', Object.assign(result,{
      register:null, 
      logged:false,
      login:null,
    }))
  else
    res.render('main', Object.assign(result, req.user, {
      register:null, 
      logged:true,
      login:null,
    })); 
});

router.get('/test', function(req, res, next) {
  res.render('test');
});
module.exports = router;
