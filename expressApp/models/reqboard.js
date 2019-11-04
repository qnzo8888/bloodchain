//reqboard 테이블과 mapping되는 model 생성
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('reqboard', {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        story: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        },
        reg_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        diagnosis: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        need_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        donated_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        is_finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        is_all_used: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        used_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        used_place:{
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        
    }, {
        timestamps: false,
        charset: 'utf8'
    });
};