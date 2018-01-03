# business-days-kr v0.1.0

## Description

- [SKT EventDay API](https://developers.sktelecom.com/content/sktApi/view/?svcId=10072) 기반으로 대한민국의 영업일 정보를 제공하는 모듈


## Installation

```console
$ npm install business-days-kr --save
```


## Usage

```js
var bizdays = require('business-days-kr');
bizdays.ready('API_SECRET_KEY');

var params = {
  year: '2018',
  month: '01'
};
bizdays.getBusinessDays(params, function(err, result) {
  console.log(result);
});
```
**Note:**
- year 미입력 시, 현재연도, month 미입력 시, 01월이 입력
- SKT API에서 2014년부터 2022년까지의 날짜정보만 제공중

## Date Type
Type | Name
:---:| ---
*d* | 영업일
*w* | 주말(토, 일)
*h* | 법정공휴일
*a* | 법정기념일
*s* | 24절기
*t* | 그 외 절기
*p* | 대중기념일
*i* | 대체공휴일
*e* | 기타


## License

MIT
