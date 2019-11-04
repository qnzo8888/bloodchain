//bdcard 테이블과 mapping되는 model 생성
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('bdcard', {
        serial_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        blood_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        blood_dona_type: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        blood_bank_name: { 
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        timestamps: false,
        charset: 'utf8'
    });
};