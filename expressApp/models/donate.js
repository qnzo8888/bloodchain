module.exports = (sequelize, DataTypes) => {
    return sequelize.define('donate', {
        finished_noticed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        used_noticed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    }, {
        timestamps: false,
        charset: 'utf8'
    });
};