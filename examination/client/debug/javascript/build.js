(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Function for handling the nickname entry */
function nickname() {
  var page_url = window.location.href;
  if (!page_url.includes('start')) {
    var button = document.getElementById('nick_name_button');

    button.addEventListener('click', function (event) {
      var nickName = document.getElementById('nick_name');
      //TODO: Save the user nickname from local storage
      localStorage.setItem('username', nickName.value);
      console.log('went through the thing');
    });
  }
}

/*To start the quiz*/
window.addEventListener('load', function () {
  var page_url = window.location.href;
  if (page_url.includes('start')) {
    //TODO: Get the user nickname from local storage
    var para = document.createElement('p');
    var nick = localStorage.getItem('username') ||'Default Nickname';
    var text = document.createTextNode(nick);

    para.appendChild(text);
    document.getElementsByTagName('main')[0].appendChild(para);

    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', reqListener);
    oReq.open('GET', 'http://vhost3.lnu.se:20080/question/1');
    oReq.send();
  }
}, false);

/* Receive the response and form the questions */
function reqListener() {
  var response = this.responseText;
  console.log(response);
  var parsedJSON = JSON.parse(response);

  var question_label = document.getElementById('question_label');
  question_label.innerHTML = 'Question number ' + parsedJSON['id'] + ':\n' + parsedJSON['question'];

//TODO:on submit button, post the answer to the new url
  var submit_button = document.getElementById('submit_button');

  submit_button.addEventListener('click', function (event) {
    var answer = document.getElementById('user_answer');

    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', reqListener);
    oReq.open('POST', parsedJSON['nextURL']);
    oReq.send();
  })
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIG5pY2tuYW1lIGVudHJ5ICovXG5mdW5jdGlvbiBuaWNrbmFtZSgpIHtcbiAgdmFyIHBhZ2VfdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIGlmICghcGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0JykpIHtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZV9idXR0b24nKTtcblxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5pY2tOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZScpO1xuICAgICAgLy9UT0RPOiBTYXZlIHRoZSB1c2VyIG5pY2tuYW1lIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgbmlja05hbWUudmFsdWUpO1xuICAgICAgY29uc29sZS5sb2coJ3dlbnQgdGhyb3VnaCB0aGUgdGhpbmcnKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlRvIHN0YXJ0IHRoZSBxdWl6Ki9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICB2YXIgcGFnZV91cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgaWYgKHBhZ2VfdXJsLmluY2x1ZGVzKCdzdGFydCcpKSB7XG4gICAgLy9UT0RPOiBHZXQgdGhlIHVzZXIgbmlja25hbWUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdmFyIHBhcmEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgdmFyIG5pY2sgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSB8fCdEZWZhdWx0IE5pY2tuYW1lJztcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5pY2spO1xuXG4gICAgcGFyYS5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFpbicpWzBdLmFwcGVuZENoaWxkKHBhcmEpO1xuXG4gICAgdmFyIG9SZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBvUmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXFMaXN0ZW5lcik7XG4gICAgb1JlcS5vcGVuKCdHRVQnLCAnaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMScpO1xuICAgIG9SZXEuc2VuZCgpO1xuICB9XG59LCBmYWxzZSk7XG5cbi8qIFJlY2VpdmUgdGhlIHJlc3BvbnNlIGFuZCBmb3JtIHRoZSBxdWVzdGlvbnMgKi9cbmZ1bmN0aW9uIHJlcUxpc3RlbmVyKCkge1xuICB2YXIgcmVzcG9uc2UgPSB0aGlzLnJlc3BvbnNlVGV4dDtcbiAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICB2YXIgcGFyc2VkSlNPTiA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuXG4gIHZhciBxdWVzdGlvbl9sYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGlvbl9sYWJlbCcpO1xuICBxdWVzdGlvbl9sYWJlbC5pbm5lckhUTUwgPSAnUXVlc3Rpb24gbnVtYmVyICcgKyBwYXJzZWRKU09OWydpZCddICsgJzpcXG4nICsgcGFyc2VkSlNPTlsncXVlc3Rpb24nXTtcblxuLy9UT0RPOm9uIHN1Ym1pdCBidXR0b24sIHBvc3QgdGhlIGFuc3dlciB0byB0aGUgbmV3IHVybFxuICB2YXIgc3VibWl0X2J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXRfYnV0dG9uJyk7XG5cbiAgc3VibWl0X2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBhbnN3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcl9hbnN3ZXInKTtcblxuICAgIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgb1JlcS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVxTGlzdGVuZXIpO1xuICAgIG9SZXEub3BlbignUE9TVCcsIHBhcnNlZEpTT05bJ25leHRVUkwnXSk7XG4gICAgb1JlcS5zZW5kKCk7XG4gIH0pXG59XG4iXX0=
