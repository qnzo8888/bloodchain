//user 테이블과 mapping되는 model 생성
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true
        },
        user_pwd: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        flag: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        business_license_num: {
            type: DataTypes.STRING(12),
            allowNull: true,
        },
        user_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        nickname: { 
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        bdcard_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        dona_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        donated_bdcard_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        class: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'bronze',
        },
        reg_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
        charset: 'utf8'
    });
};