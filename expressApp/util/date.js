function getFormatDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    var day = date.getDate();
    day = day >= 10 ? day : '0' + day;
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds();
}

exports.getFormatDate = getFormatDate;