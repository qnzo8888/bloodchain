const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;

module.exports = () => {
    passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
        done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
    });

    passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
        done(null, user); // 여기의 user가 req.user가 됨
    });

    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'user_id',
        passwordField: 'user_pwd',
        session: true, // 세션에 저장 여부
        passReqToCallback: true,
    }, (req, user_id, user_pwd, done) => {
        User.findOne({
            where: {
                user_id: user_id
            }
        }).then((user) => {
            if (!user)
                return done(null, false, { message: '존재하지 않는 아이디입니다' });
            if(user.dataValues.user_pwd != user_pwd)
                return done(null, false, { message: '비밀번호가 틀렸습니다' });
            else
                return done(null, user);
        })
    }));
};

