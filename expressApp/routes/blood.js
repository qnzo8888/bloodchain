var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var invokeSDK = require('../../fabric/nodejs-sdk/invoke.js');
var querySDK = require('../../fabric/nodejs-sdk/query.js');

const { User, Bdcard, Reqboard, Donate } = require('../models');

// 헌혈증 등록    main화면에서 헌혈증 등록하러가기 >> 버튼
router.get('/blood_register', function (req, res, next) {
    if(req.user)
      res.render('blood_register_form', Object.assign(req.user, { register: null }));
    else{
      res.render('blood_register_form')
    }

});

// 헌혈증 등록 처리
router.post('/blood_register_do', function (req, res, next) {
  var duplicated = false;

  // 헌혈증 중복 검사
  Bdcard.findAll({
    attributes: ['serial_number'],
  }).then(function (resultHash) {
    resultHash.forEach(element => {
      data = element.dataValues;
      serial_number = data.serial_number;
      if (req.body.bnum == serial_number) {
        duplicated = true;
        res.render('blood_register_form', Object.assign(req.user, { register: "fail" }));
      }

    });
  }).then(function () { // node.js 비동기 처리 위해 위처럼 따로 User.create 안하고 then 씀.
    // duplicated == false일 때(중복 아닐때) db에 저장
    if (duplicated == false) {
      Bdcard.create({
        serial_number: req.body.bnum,
        blood_date: req.body.bdate,
        blood_dona_type: req.body.btype,
        blood_bank_name: req.body.bname
      }).then(function (Bdcard) {
        console.log('success');
        req.user.bdcard_count += 1;
        User.update({
          bdcard_count: req.user.bdcard_count,
        }, {
          where: { user_id: req.body.owner_id },
        }).then(function(User){
          invokeSDK.invoke('register', [req.body.bnum, req.body.owner_id]);
          res.render('blood_register_form', Object.assign(req.user, {register: "success"}));
        }).catch(function(err){
          console.log(err);
        })

      }).catch(function (err) {
        console.log(err);
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
});


// 마이페이지 - 내 기부요청 관리 라우터
router.get('/my_blood_request', function (req, res, next) {
  Reqboard.findAll({
    order: [['id', 'DESC']],
    include: [
      {model: User, required: true},
    ],
    where: {req_user_id: req.user.user_id}
  }).then(function (reqboards) {
    if (req.user) {
      res.render('my_blood_request', Object.assign(req.user, {reqboards: reqboards}));
    }else{
      res.render('my_blood_request');
    }
  }).catch(function (err) {
    console.log(err);
  });
});


// 마이페이지 - 내 기부요청 관리 - 삭제처리
router.post('/my_blood_request_delete', function (req, res, next) {
  var id = Number(req.body.id);

  Reqboard.destroy({
    where: { id: id }
  }).then(function (result) {
    res.send(req.user);
  }).catch(function (err) {
    console.log(err);
  });
});


// 헌혈증 기부, 기부요청목록, 기부요청 메인화면    main화면에서 기부하러/받으러 가기 >> 버튼 
router.get('/blood_donation_main', function (req, res, next) {
  Reqboard.findAll({
    order: [['id', 'DESC']],
    include: [
      {model: User, required: true},
    ]
  }).then(function (reqboards) {
    var resultHash = {};
    if (req.user) {
      Object.assign(resultHash, req.user);
    }
    Object.assign(resultHash, { register: false });
    Object.assign(resultHash, { reqboards: reqboards });

    res.render('blood_donation_main', resultHash);
  }).catch(function (err) {
    console.log(err);
  });
  
});

// 헌혈증 기부요청   main화면에서 기부요청글 올리기 >> 버튼 
router.get('/blood_request', function (req, res, next) {
  if(req.user){
    res.render('blood_request_form', req.user);
  }else{
    res.render('blood_request_form');
  }
});

// 헌혈증 기부요청 처리
router.post('/blood_request_do', function (req, res, next) {

  Reqboard.create({
    diagnosis: req.body.diagnosis,
    title: req.body.title,
    need_count: req.body.need_count,
    story: req.body.story,
    used_place: req.body.used_place,
    req_user_id: req.body.req_user_id,
  }).then(function () {
    console.log('success');

    Reqboard.findAll({
      order: [['reg_date', 'DESC']],
      include: [
        {model: User, required: true},
      ]
    }).then(function (reqboards) {
      var resultHash = {};
      Object.assign(resultHash, req.user);
      Object.assign(resultHash, { register: "success" });
      if (reqboards) {
        Object.assign(resultHash, { reqboards: reqboards });
      }
      res.render('blood_donation_main', resultHash);
    }).catch(function (err) {
      console.log(err);
    })

  }).catch(function (err) {
    console.log(err);
  });
});

//헌혈증 기부 처리
router.post('/blood_donation', async function (req, res, next) {
  var donate_count = Number(req.body.donate_count);
  var donated_count = Number(req.body.donated_count);
  var need_count = Number(req.body.need_count);
  var req_user_id = req.body.req_user_id;
  var used_place = req.body.used_place;
  var id = req.body.id;
  var req_donated_bdcard_count = Number(req.body.req_donated_bdcard_count);
  var user_bdcard_count = Number(req.body.user_bdcard_count);

  var donater = req.user.user_id;
  
  // bc 기부처리 (헌혈증 소유자, 기부여부, 기부날짜 등 업데이트)
  var serials = await querySDK.query('querySerialsForDonate', [donate_count, donater]);
  serials.forEach((serial) => {
    invokeSDK.invoke('donate', [serial, req_user_id, used_place]);
  });

  await Bdcard.update({
    req_id: id
  },{
    where: {serial_number: serials}
  }).catch(function(err){
    console.log(err);
  })

  // 기부자 헌혈증 개수 감소, 기부 개수 증가 
  req.user.bdcard_count -= donate_count;
  user_bdcard_count -= donate_count;
  req.user.dona_count += donate_count;

  var count = req.user.dona_count;
  var newclass = req.user.class;
  var temp = newclass;
  var is_up = false;

  if (count >= 30)
    newclass = 'diamond'
  else if (count >= 15)
    newclass = 'platinum'
  else if (count >= 10)
    newclass = 'gold'
  else if (count >= 5)
    newclass = 'silver'
  if(newclass != temp)
    is_up = true;

  await User.update({
    bdcard_count: user_bdcard_count,
    dona_count: req.user.dona_count,
    class: newclass
  },{
      where: { user_id: donater }
  }).catch(function (err) {
    console.log(err);
  });

  
  // 기부 요청자 헌혈증 개수 증가
  await User.update({
    donated_bdcard_count: req_donated_bdcard_count + donate_count
  },{
      where: { user_id: req_user_id }
  }).catch(function (err) {
    console.log(err);
  })
  
  // 기부요청의 기부 개수 상태 업데이트
  var donated_count_update = donate_count + donated_count;
  var need_more = need_count - donated_count_update;

  if(need_count == donated_count_update)
    var is_finished = true;
  else
    var is_finished = false;

  await Reqboard.update({
    donated_count: donated_count_update,
    is_finished: is_finished,
  },{
    where: {id: id},
  }).catch(function(err){
    console.log(Err);
  })

  // 알람 위해 
  var donate = await Donate.findOne({
    where: {donated_id: id, donater: donater}
  })
  if(!donate){
    await Donate.create({
      donater: donater,
      donated_id: id
    });
  }
  res.send(Object.assign(req.user, {
    user_bdcard_count: user_bdcard_count.toString(),
    donated_count: donated_count_update.toString(), 
    need_more: need_more.toString(),
    req_donated_bdcard_count: (req_donated_bdcard_count + donate_count).toString(),
    is_finished: is_finished,
    is_up: is_up,
    class: newclass
  }));
  
  
});

// 헌혈증 사용 처리
router.post('/blood_use', async function (req, res, next) {
  
  // id에 해당하는 요청글에 기부된 헌혈증들 가져옴
  var bdcards = await Bdcard.findAll({
    where:{req_id: Number(req.body.id)}
  })
  
  // 가져온 헌헐증 invoke로 사용처리(원장의 상태db 업데이트)
  bdcards.forEach((bdcard) => {
    console.log(bdcard.serial_number);
    invokeSDK.invoke('use', [bdcard.serial_number.toString()]);
  });

  // 요청글 사용 플래그
  await Reqboard.update({
    is_all_used: true,
    used_date: new Date()
  },{
    where:{id: Number(req.body.id)}
  })

  
  res.send(req.user);
});

// async function assignObject(bcBloods){
//   var resultHash = new Array();

//   await bcBloods.forEach(async (bcBlood) => {
//     var dbBlood = await Bdcard.findOne({
//       where: {serial_number: bcBlood.Key},
//       include: [
//         {model: Reqboard, required: true},
//       ]
//     })
//     if(!resultHash[dbBlood.req_id]){
//       //console.log('zzzz ---------->' + JSON.stringify(resultHash));
//       resultHash[dbBlood.req_id] = [dbBlood];
        
//         // is_donated: dbBlood.reqboard.is_finished,
//         // is_all_used: dbBlood.reqboard.is_all_used,
//         // used_place: dbBlood.reqboard.used_place
      
//     }else{
//       resultHash[dbBlood.req_id].push(dbBlood);
//     }
//   });

//   return new Promise(function(resolve, reject){
//     resolve(resultHash);
//   });
// }

// 기부요청글별로 기부내역 보기
router.get('/blood_history_req', async function (req, res, next) {
  var req_id = null;
  
  var user = req.user.user_id;
  var bcBloods = await querySDK.query('dona', user);

  var resultHash = new Array();

  for(bcBlood of bcBloods){
    var dbBlood = await Bdcard.findOne({
      where: {serial_number: bcBlood.Key},
      include: [
        {model: Reqboard, required: true},
      ]
    })
    var req_id = dbBlood.req_id;
    if(!resultHash[req_id]){
      resultHash[req_id] = [dbBlood];
    }else{
      resultHash[req_id].push(dbBlood);
    }
  }

  // 알림의 버튼을 통해 요청했을 경우
  if(req.query.req_id){
    // 알림여부 업데이트
    if(req.query.alarm == 'fin'){
      await Donate.update({
        finished_noticed: true
      },{
        where: {donater: user, donated_id: req.query.req_id},
      });
    } else {
      await Donate.update({
        used_noticed: true
      },{
        where: {donater: user, donated_id: req.query.req_id},
      });
    }
    // 알림된 req_id 강조
    req_id = req.query.req_id;
  }

  if(req.user)
    res.render('blood_history_req', Object.assign(req.user, { resultHash: resultHash, req_id: req_id}));
  else
    res.render('blood_history_req');

  
});

// 특정 기부요청글에 대해 자신이 기부한 헌혈증 목록
router.get('/blood_history_dona', async function (req, res, next){
  var user = req.user.user_id;
  var req_id = Number(req.query.req_id);
  var bcBloods = await querySDK.query('dona', user);

  var data = [];

  for(bcBlood of bcBloods){
    var dbBlood = await Bdcard.findOne({
      where: {serial_number: bcBlood.Key},
    })
    if(dbBlood.req_id == req_id){
      bcBlood.Record.dbBlood = dbBlood;
      data.push(bcBlood);   
    }
  }
  if(req.user)
    res.render('blood_history_dona', Object.assign(req.user, {data: data, req: true}));
  else
    res.render('blood_history_dona');
})

// 기부한 모든 헌혈증 목록
router.get('/blood_history_dona_all', async function (req, res, next){
  var user = req.user.user_id;
  var bcBloods = await querySDK.query('dona', user);

  var data = [];

  for(bcBlood of bcBloods){
    var dbBlood = await Bdcard.findOne({
      where: {serial_number: bcBlood.Key},
    })
    bcBlood.Record.dbBlood = dbBlood;
    data.push(bcBlood);   
  }
  if(req.user)
    res.render('blood_history_dona', Object.assign(req.user, {data: data, req: false}));
  else
    res.render('blood_history_dona');
})
// 등록했지만 아직 기부하지 않은 헌혈증 목록
router.get('/onlyReg_blood_list', async function (req, res, next) { 
  var owner = req.user.user_id;
  var bcbloods = await querySDK.query('onlyreg', owner);

  var data = [];

  for(bcblood of bcbloods){
    var dbblood = await Bdcard.findOne({
      where: {serial_number: bcblood.Key}
    })
    bcblood.Record.dbblood = dbblood;
    data.push(bcblood);
  }
  if (req.user)
    res.render('onlyReg_blood_list', Object.assign(req.user, {data: data}));
  else
    res.render('onlyReg_blood_list');
});

// 기부받은 헌혈증 내역 확인
router.get('/donated_blood_list', async function (req, res, next) {
  var owner = req.user.user_id;
  var serials = await querySDK.query('donated', owner);

  console.log(JSON.stringify(Object.assign(req.user, {data: serials})));

  if (req.user)
    res.render('donated_blood_list', Object.assign(req.user, {data: serials}));
  else
    res.render('donated_blood_list');
});



// 기부, 사용에 대한 알림을 위한 라우터

// 기부 완료되거나 완료되었는데 아직 사용 안된 상태면 used: false 전송해서 알림 (기부요청자 입장)
router.post('/donated_finished_check', async function (req, res, next){
  var user = req.user.user_id;
  
  var reqboards = await Reqboard.findAll({
    where: {req_user_id: user, is_finished: true, is_all_used: false},
    attributes: ['id']
  })
  var result = {};
  if(req.user)
    Object.assign(result, req.user);

  if(reqboards.length != 0){
    res.send(Object.assign(result, {
      reqboards: reqboards,
      used: false
    }));
  }else{
    res.send(Object.assign(result, {
      used: true
    }));
  }
})

// 내가 기부한 기부요청글의 모든 기부가 완료되거나 사용되면 알림(기부자 입장)
router.post('/dona_finished_check', async function (req, res, next){
  var user = req.user.user_id;

  var donates = await Donate.findAll({
    where: {donater: user},
    include: [
      {model: Reqboard, required: true}
    ]
  });
  
  var finish = false;
  var use = false;
  var req_id = null;
  for(donate of donates){
    if(donate.reqboard.is_finished && !donate.finished_noticed){
      finish = true;
      req_id = donate.reqboard.id;
    }
    if(donate.reqboard.is_all_used && !donate.used_noticed){
      use = true;
      req_id = donate.reqboard.id;
    }
  }
  if(req.user){
    res.send(Object.assign(req.user, {
      finish: finish,
      use: use,
      req_id: req_id
    }))
  }
})

module.exports = router;
