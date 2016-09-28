(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isQuestion = true;

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

/*To start the quiz with only the first question*/
window.addEventListener('load', function () {
  var page_url = window.location.href;

  //Check if this is the first question
  if (page_url.includes('start.html?contestant_name')) {
    //TODO: Get the user nickname from local storage
    var para = document.createElement('p');
    var nick = localStorage.getItem('username') ||'Default Nickname';
    var text = document.createTextNode(nick);

    para.appendChild(text);
    document.getElementsByTagName('main')[0].appendChild(para);

    var questionUrl = 'http://vhost3.lnu.se:20080/question/1';
    createRequest(questionUrl);
  }
}, false);

/* Receive the response and form the questions */
function reqListener() {
  console.log('Reply from server: '+ this.responseText);
  var parsedJSON = JSON.parse(this.responseText);

  if(!this.response.includes('alternatives')) {
    var no_alt_template = document.getElementById('no_alternative');
    //debugger;
    temp_clone = document.importNode(no_alt_template.content.firstElementChild, true);
    document.getElementsByClassName('input-field col s6')[0].appendChild(temp_clone);

    var question_label = document.getElementById('question_label_no_alt');
    question_label.innerHTML = 'Question number ' + parsedJSON['id'] + ':\n' + parsedJSON['question'];

//TODO:on submit button, post the answer to the new url
    var submit_button = document.getElementById('submit_button_noalt');

    submit_button.addEventListener('click', function (event) {

      var answer = document.getElementById('user_answer').value;

      var jsonObject = {"answer":answer};
      jsonObject = JSON.stringify(jsonObject);

      var oReq = new XMLHttpRequest();
      oReq.onreadystatechange = function () {
        console.log('read state: ' + oReq.readyState);
        if(oReq.readyState == 4 && oReq.status == 200 ) {
          alert(oReq.responseText);
          checkAnswer(oReq.responseText);
          //    debugger;
        }

      };
      oReq.open('POST', parsedJSON['nextURL'], true);
      oReq.setRequestHeader('Content-Type', 'application/json');
      oReq.send(jsonObject);
      //   debugger;
    })
  }
}

function createRequest(url) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', reqListener);
  oReq.open('GET', url, true);
  oReq.send();
}

function checkAnswer(response) {
  var nextURL;
  if(response.includes('Correct')) {
    response = JSON.parse(response);
    nextURL = response['nextURL'];
    createRequest(nextURL);
  }

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaXNRdWVzdGlvbiA9IHRydWU7XG5cbi8qIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgbmlja25hbWUgZW50cnkgKi9cbmZ1bmN0aW9uIG5pY2tuYW1lKCkge1xuICB2YXIgcGFnZV91cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgaWYgKCFwYWdlX3VybC5pbmNsdWRlcygnc3RhcnQnKSkge1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmlja19uYW1lX2J1dHRvbicpO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmlja05hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmlja19uYW1lJyk7XG4gICAgICAvL1RPRE86IFNhdmUgdGhlIHVzZXIgbmlja25hbWUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCBuaWNrTmFtZS52YWx1ZSk7XG4gICAgICBjb25zb2xlLmxvZygnd2VudCB0aHJvdWdoIHRoZSB0aGluZycpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qVG8gc3RhcnQgdGhlIHF1aXogd2l0aCBvbmx5IHRoZSBmaXJzdCBxdWVzdGlvbiovXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VfdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgLy9DaGVjayBpZiB0aGlzIGlzIHRoZSBmaXJzdCBxdWVzdGlvblxuICBpZiAocGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0Lmh0bWw/Y29udGVzdGFudF9uYW1lJykpIHtcbiAgICAvL1RPRE86IEdldCB0aGUgdXNlciBuaWNrbmFtZSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICB2YXIgcGFyYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICB2YXIgbmljayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpIHx8J0RlZmF1bHQgTmlja25hbWUnO1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmljayk7XG5cbiAgICBwYXJhLmFwcGVuZENoaWxkKHRleHQpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWluJylbMF0uYXBwZW5kQ2hpbGQocGFyYSk7XG5cbiAgICB2YXIgcXVlc3Rpb25VcmwgPSAnaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMSc7XG4gICAgY3JlYXRlUmVxdWVzdChxdWVzdGlvblVybCk7XG4gIH1cbn0sIGZhbHNlKTtcblxuLyogUmVjZWl2ZSB0aGUgcmVzcG9uc2UgYW5kIGZvcm0gdGhlIHF1ZXN0aW9ucyAqL1xuZnVuY3Rpb24gcmVxTGlzdGVuZXIoKSB7XG4gIGNvbnNvbGUubG9nKCdSZXBseSBmcm9tIHNlcnZlcjogJysgdGhpcy5yZXNwb25zZVRleHQpO1xuICB2YXIgcGFyc2VkSlNPTiA9IEpTT04ucGFyc2UodGhpcy5yZXNwb25zZVRleHQpO1xuXG4gIGlmKCF0aGlzLnJlc3BvbnNlLmluY2x1ZGVzKCdhbHRlcm5hdGl2ZXMnKSkge1xuICAgIHZhciBub19hbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9fYWx0ZXJuYXRpdmUnKTtcbiAgICAvL2RlYnVnZ2VyO1xuICAgIHRlbXBfY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKG5vX2FsdF90ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5hcHBlbmRDaGlsZCh0ZW1wX2Nsb25lKTtcblxuICAgIHZhciBxdWVzdGlvbl9sYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGlvbl9sYWJlbF9ub19hbHQnKTtcbiAgICBxdWVzdGlvbl9sYWJlbC5pbm5lckhUTUwgPSAnUXVlc3Rpb24gbnVtYmVyICcgKyBwYXJzZWRKU09OWydpZCddICsgJzpcXG4nICsgcGFyc2VkSlNPTlsncXVlc3Rpb24nXTtcblxuLy9UT0RPOm9uIHN1Ym1pdCBidXR0b24sIHBvc3QgdGhlIGFuc3dlciB0byB0aGUgbmV3IHVybFxuICAgIHZhciBzdWJtaXRfYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdF9idXR0b25fbm9hbHQnKTtcblxuICAgIHN1Ym1pdF9idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgdmFyIGFuc3dlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyX2Fuc3dlcicpLnZhbHVlO1xuXG4gICAgICB2YXIganNvbk9iamVjdCA9IHtcImFuc3dlclwiOmFuc3dlcn07XG4gICAgICBqc29uT2JqZWN0ID0gSlNPTi5zdHJpbmdpZnkoanNvbk9iamVjdCk7XG5cbiAgICAgIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICBvUmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3JlYWQgc3RhdGU6ICcgKyBvUmVxLnJlYWR5U3RhdGUpO1xuICAgICAgICBpZihvUmVxLnJlYWR5U3RhdGUgPT0gNCAmJiBvUmVxLnN0YXR1cyA9PSAyMDAgKSB7XG4gICAgICAgICAgYWxlcnQob1JlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIGNoZWNrQW5zd2VyKG9SZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAvLyAgICBkZWJ1Z2dlcjtcbiAgICAgICAgfVxuXG4gICAgICB9O1xuICAgICAgb1JlcS5vcGVuKCdQT1NUJywgcGFyc2VkSlNPTlsnbmV4dFVSTCddLCB0cnVlKTtcbiAgICAgIG9SZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIG9SZXEuc2VuZChqc29uT2JqZWN0KTtcbiAgICAgIC8vICAgZGVidWdnZXI7XG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVSZXF1ZXN0KHVybCkge1xuICB2YXIgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICBvUmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXFMaXN0ZW5lcik7XG4gIG9SZXEub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgb1JlcS5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQW5zd2VyKHJlc3BvbnNlKSB7XG4gIHZhciBuZXh0VVJMO1xuICBpZihyZXNwb25zZS5pbmNsdWRlcygnQ29ycmVjdCcpKSB7XG4gICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICBuZXh0VVJMID0gcmVzcG9uc2VbJ25leHRVUkwnXTtcbiAgICBjcmVhdGVSZXF1ZXN0KG5leHRVUkwpO1xuICB9XG5cbn1cbiJdfQ==
