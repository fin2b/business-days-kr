/**
 * Copyright 2016 Fin2B Inc. (http://fin2b.com/)
 * All Right Reserved.
 *
 * NOTICE : All information contained herein is, and remains
 * the property of Fin2B Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Fin2B Incorporated
 * and its suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Fin2B Incorporated.
 *
 * @ CreatedAt 2017. 12. 28.
 * @ Author(s):
 *     fin2b
 **/
var request = require('request');
var moment = require('moment-business-days');
var _ = require('lodash');

var TDCProjectKey = '';

module.exports = {

  /**
   * Set key for calling SKT EventDay API (https://developers.sktelecom.com/content/sktApi/)
   * @param {string} [secretKey='...'] The string about secret key.
   */
  ready : function(secretKey) {
    TDCProjectKey = secretKey;
  },

  /**
   * Get event day info.
   * @param params {Object} The parameters object.
   * @param params.year {string} [params.year='2018'] The string about year.
   * @param params.month {string} [params.month='01'] The string about month.
   * @param params.type {string} [params.type='h,i'] The type of days.
   * @param cb {function} [cb=function(err, result)] callback function.
   * @return
   */
  getBusinessDays : function(params, cb) {
    if( params.year ) {
      if(typeof params.year === "string" && params.year.length === 4 && params.year.slice(0,2) == '20'){
        if(Number(params.year) > 2023 || Number(params.year) < 2014){
          return cb("params error: year from '2014' to '2023' required");
        }
        var year = params.year;
      } else {
        return cb("params error: invalid input. '20YY' format required");
      }
    } else {
      year = moment().format('YYYY');
    }

    if( params.month ) {
      if(typeof params.month === "string" && params.month.length === 2){
        if(Number(params.month) < 1 || Number(params.month) > 12){
          return cb("params error: month 'MM' from '01' to '12' required");
        }
        var month = params.month;
      } else {
        return cb("params error: month invalid input. 'MM' format required");
      }
    } else {
      month = '';
    }

    var day = '';
    var type = 'h,i';
    if( params.type ) {
      type = type.concat(',', params.type);
      type = Array.from(new Set(type.split(','))).toString();
    }

    var options = {
      url: 'https://apis.sktelecom.com/v1/eventday/days?type=' + type + '&year=' + year + '&month=' + month + '&day=' + day,
      headers: {
        TDCProjectKey: TDCProjectKey
      }
    };

    request(options, function (err, resp, body) {
      if(err) cb(err);

      if (!err && resp.statusCode == 200) {
        var parsedResults = JSON.parse(body).results;
        var specialDays = [];
        var fullDate = '';

        for (var i = 0; i < parsedResults.length; i++) {
          var elt = parsedResults[i];

          fullDate = [elt.year, elt.month, elt.day].join('-');

          specialDays.push({
            solarDate: fullDate,
            day: moment(fullDate).format("ddd"),
            type: elt.type,
            description: elt.name
          });
        }

        // 평일(type: d), 주말(type: w) 구하기
        var getDaysAndWeekends = getDaysOfYear(year, month);

        _.forEach(specialDays, function(value) {
          var index = _.findIndex(getDaysAndWeekends, function(o) {
            return o.solarDate === value.solarDate;
          });
          getDaysAndWeekends[index].type = getDaysAndWeekends[index].type.concat(',', value.type);
          getDaysAndWeekends[index].description = value.description;
        });

        var sortedValues = _.sortBy(getDaysAndWeekends, 'solarDate');

        cb(null, sortedValues);
        return null;
      }
    });
  }
};

function getDaysOfYear(year, month) {
  var date = '';
  var arr = [];
  var startDayOfYear = '';
  var endDayOfYear = '';

  if (month === '') {
    date = year + '-01-01';
    startDayOfYear = 1;
    endDayOfYear = moment(date).endOf('year').dayOfYear();
  } else {
    date = year + '-' + month + '-01' ;
    startDayOfYear = moment(date).dayOfYear();
    endDayOfYear = moment(date).endOf('month').dayOfYear();
  }

  for(var d = startDayOfYear; d <= endDayOfYear; d ++){
    if( moment(date).dayOfYear(d).day() == 0 || moment(date).dayOfYear(d).day() == 6 ){
      var type = 'w';
    } else {
      type = 'd';
    }
    arr.push({
      solarDate : moment(date).dayOfYear(d).format("YYYY-MM-DD"),
      day : moment(date).dayOfYear(d).format("ddd"),
      type: type
    });
  }
  return arr;
}
