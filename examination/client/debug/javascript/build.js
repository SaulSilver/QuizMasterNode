(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var timer;
var elapsedCounter;

//If the local storage isn't empty, else Set up the highscore table
if(localStorage.length != 0) {
  var nickname;
  var time;
  var tableNames = document.getElementsByClassName('table_user');
  var tableTimes = document.getElementsByClassName('table_time');
  for (var i = 0; i < localStorage.length; i++) {
    //Takes the top 5 highscores only
    if(i == 5)
      break;
    nickname = localStorage.key(i);
    time = localStorage[nickname];
    var name = tableNames.item(i);
    name.innerText = nickname;
    var time1 = tableTimes.item(i);
    time1.innerText = time;
  }
}

var page_url = window.location.href;
// This will make the next block of code go only in the welcome page
if (!page_url.includes('start')) {
  var button = document.getElementById('nick_name_button');
  button.addEventListener('click', function (event) {
    sessionStorage.setItem('counter', JSON.stringify(Date.now()));
    //Save the nickname in the session storage
    var nickName = document.getElementById('nick_name');
    sessionStorage.setItem('username', nickName.value ||'Default Nickname');
  });
}

/*To start the quiz with only the first question*/
window.addEventListener('load', function () {
  var page_url = window.location.href;

  //Check if this is the first question
  if (page_url.includes('start.html?contestant_name')) {
    var timerText = document.getElementById('timer');
    var start = Date.now();
    timer = setTimeout(function () {
      returnToMain('Time is up')
    }, 21000);
    // TODO: update the text for timer
     var showTimer = setInterval(function () {
       timerText.innerText = (Date.now() - start) / 1000 + ' : 20';
     }, 1000);

    //Show nickname
    var header = document.getElementsByTagName('h1')[0];
    var nick = sessionStorage.getItem('username');
    header.innerText = 'Yo! ' + nick;

    var questionUrl = 'http://vhost3.lnu.se:20080/question/1';
    //Send a GET request to retrieve the first question
    createGetRequest(questionUrl);
  }
}, false);

/* Receive the response and form the questions */
function reqListener() {
  var parsedJSON = JSON.parse(this.responseText);

  /* For questions without choices */
  if(!this.response.includes('alternatives')) {

    //Using the template with no alternatives
    var no_alt_template = document.getElementById('no_alternative');
    var temp_clone = document.importNode(no_alt_template.content.firstElementChild, true);
    document.getElementsByClassName('input-field col s6')[0].appendChild(temp_clone);

    var question_label = document.getElementById('question_label_no_alt');
    question_label.innerText = 'Question number ' + parsedJSON['id'] + ':\n' + parsedJSON['question'];

    var submit_button = document.getElementById('submit_button_noalt');

    submit_button.addEventListener('click', function (event) {
      clearTimeout(timer);
      var answer = document.getElementById('user_answer').value;

      //Method call to create the post request
      createPostRequest(parsedJSON, answer);
      //Clear the template from the page (prevents overlapped templates)
      document.getElementsByClassName('input-field col s6')[0].removeChild(temp_clone);
    });
  }

  /* For questions with choices */
  else {
    //Checking the number of alternatives
    var alternatives_number;
    if(this.responseText.includes('alt4'))
      alternatives_number = 4;
    else alternatives_number = 3;

    //Using the template with no alternatives
    var alt_template = document.getElementById('alternative');
    var temp_alt_clone = document.importNode(alt_template.content.firstElementChild, true);
    document.getElementsByClassName('input-field col s6')[0].appendChild(temp_alt_clone);

    var question_label_alt = document.getElementById('question_label_alt');
    question_label_alt.innerText = 'Question ' + parsedJSON['id'] + ': \t'+ parsedJSON['question'];

    var labels = document.getElementsByClassName('labels');

    //Adding the alternatives labels to the radio buttons
    for (var i = 0; i < alternatives_number ; i++) {
      var alt = 'alt'+ (i + 1);
      labels[i].innerText =  parsedJSON.alternatives[alt];
    }
    //Checks if there is only 3 alternatives, then remove the 4th radio button
    if(alternatives_number == 3)
      document.getElementById('div_inside_temp').removeChild(document.getElementById('alt4_div'));

    var submitAns = document.getElementById('submit_button_alt');
    var answer;
    submitAns.addEventListener('click', function (event) {
      clearTimeout(timer);
      var radioButtons = document.getElementsByName('group1');
      //To check which radio button is chosen
      for (var i = 0; i < radioButtons.length; i++) {
        var what = radioButtons[i];
        if (radioButtons[i].checked) {
          answer = radioButtons[i].id;
          break;
        }
      }
      //Method call to create the post request
      createPostRequest(parsedJSON, answer);
      //Clear the template from the page (prevents overlapped templates)
      document.getElementsByClassName('input-field col s6')[0].removeChild(temp_alt_clone);
    });
  }
}

/* A method to create a GET request with the specified 'url' */
function createGetRequest(url) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', reqListener);
  oReq.open('GET', url, true);
  oReq.send();
}

/* A method to create a POST request with the specified 'answer' and 'parsedJSON' to get the next url */
function createPostRequest(parsedJSON, answer) {
  var jsonObject = {"answer":answer};
  jsonObject = JSON.stringify(jsonObject);

  var oReq = new XMLHttpRequest();

  oReq.onreadystatechange = function () {
    if(oReq.readyState == 4 && oReq.status == 200 ) {

      var response = JSON.parse(oReq.responseText);
      //The quiz is not over
      if(response['nextURL'] != null)
        createGetRequest(response['nextURL']);
      //The quiz is over
      else {
        elapsedCounter = (Date.now() - parseInt(JSON.parse(sessionStorage.getItem('counter')))) / 1000;
        returnToMain('Congratulations! You have aced this crazy blazy quiz! ' + elapsedCounter);
      }
    } else if(oReq.readyState == 4 && oReq.status == 400 ) {
      returnToMain('You have answered wrong mate :(' +  '\nTry again!');
    }
  };
  oReq.open('POST', parsedJSON['nextURL'], true);
  oReq.setRequestHeader('Content-Type', 'application/json');
  oReq.send(jsonObject);
}

/*Method that takes the user back to the main page */
function returnToMain(message) {
  //TODO: stop counter, save score in web storage and show it in the alert window
  clearTimeout(timer);
  var nickname = sessionStorage.getItem('username');

  checkLocalStorage(nickname, elapsedCounter);

  window.location.href = 'index.html';
  alert(message);
}

/*A method to sort the highscore table according to the user time */
function checkLocalStorage(newName, newHighscore) {
  if(localStorage.length != 0) {
    var newArray = [newName, newHighscore];
    var nickname;
    var time;
    var oneScore;
    var highscoreArray = new Array(localStorage.length + 1);
    for (var i = 0; i < localStorage.length; i++) {
      nickname = localStorage.key(i);
      time  = localStorage[nickname];
      oneScore = [nickname, time];
      highscoreArray.push(oneScore);
    }
    localStorage.clear();
    highscoreArray.push(newArray);
    //Sort according to time
    highscoreArray.sort(function (k1, k2) {
      var tim1 =  k2[1];
      var tim2 =  k1[1];
      return tim1- tim2;
    });

    for (var k = 0; k < highscoreArray.length / 2; k++) {
      oneScore = highscoreArray[k];
      localStorage.setItem(oneScore[0], oneScore[1]);
    }
  } else {
    localStorage.setItem(newName, newHighscore);
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHRpbWVyO1xudmFyIGVsYXBzZWRDb3VudGVyO1xuXG4vL0lmIHRoZSBsb2NhbCBzdG9yYWdlIGlzbid0IGVtcHR5LCBlbHNlIFNldCB1cCB0aGUgaGlnaHNjb3JlIHRhYmxlXG5pZihsb2NhbFN0b3JhZ2UubGVuZ3RoICE9IDApIHtcbiAgdmFyIG5pY2tuYW1lO1xuICB2YXIgdGltZTtcbiAgdmFyIHRhYmxlTmFtZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0YWJsZV91c2VyJyk7XG4gIHZhciB0YWJsZVRpbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGFibGVfdGltZScpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgIC8vVGFrZXMgdGhlIHRvcCA1IGhpZ2hzY29yZXMgb25seVxuICAgIGlmKGkgPT0gNSlcbiAgICAgIGJyZWFrO1xuICAgIG5pY2tuYW1lID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICB0aW1lID0gbG9jYWxTdG9yYWdlW25pY2tuYW1lXTtcbiAgICB2YXIgbmFtZSA9IHRhYmxlTmFtZXMuaXRlbShpKTtcbiAgICBuYW1lLmlubmVyVGV4dCA9IG5pY2tuYW1lO1xuICAgIHZhciB0aW1lMSA9IHRhYmxlVGltZXMuaXRlbShpKTtcbiAgICB0aW1lMS5pbm5lclRleHQgPSB0aW1lO1xuICB9XG59XG5cbnZhciBwYWdlX3VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuLy8gVGhpcyB3aWxsIG1ha2UgdGhlIG5leHQgYmxvY2sgb2YgY29kZSBnbyBvbmx5IGluIHRoZSB3ZWxjb21lIHBhZ2VcbmlmICghcGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0JykpIHtcbiAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduaWNrX25hbWVfYnV0dG9uJyk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NvdW50ZXInLCBKU09OLnN0cmluZ2lmeShEYXRlLm5vdygpKSk7XG4gICAgLy9TYXZlIHRoZSBuaWNrbmFtZSBpbiB0aGUgc2Vzc2lvbiBzdG9yYWdlXG4gICAgdmFyIG5pY2tOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZScpO1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgbmlja05hbWUudmFsdWUgfHwnRGVmYXVsdCBOaWNrbmFtZScpO1xuICB9KTtcbn1cblxuLypUbyBzdGFydCB0aGUgcXVpeiB3aXRoIG9ubHkgdGhlIGZpcnN0IHF1ZXN0aW9uKi9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICB2YXIgcGFnZV91cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAvL0NoZWNrIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHF1ZXN0aW9uXG4gIGlmIChwYWdlX3VybC5pbmNsdWRlcygnc3RhcnQuaHRtbD9jb250ZXN0YW50X25hbWUnKSkge1xuICAgIHZhciB0aW1lclRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXInKTtcbiAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm5Ub01haW4oJ1RpbWUgaXMgdXAnKVxuICAgIH0sIDIxMDAwKTtcbiAgICAvLyBUT0RPOiB1cGRhdGUgdGhlIHRleHQgZm9yIHRpbWVyXG4gICAgIHZhciBzaG93VGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgdGltZXJUZXh0LmlubmVyVGV4dCA9IChEYXRlLm5vdygpIC0gc3RhcnQpIC8gMTAwMCArICcgOiAyMCc7XG4gICAgIH0sIDEwMDApO1xuXG4gICAgLy9TaG93IG5pY2tuYW1lXG4gICAgdmFyIGhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoMScpWzBdO1xuICAgIHZhciBuaWNrID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcbiAgICBoZWFkZXIuaW5uZXJUZXh0ID0gJ1lvISAnICsgbmljaztcblxuICAgIHZhciBxdWVzdGlvblVybCA9ICdodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xJztcbiAgICAvL1NlbmQgYSBHRVQgcmVxdWVzdCB0byByZXRyaWV2ZSB0aGUgZmlyc3QgcXVlc3Rpb25cbiAgICBjcmVhdGVHZXRSZXF1ZXN0KHF1ZXN0aW9uVXJsKTtcbiAgfVxufSwgZmFsc2UpO1xuXG4vKiBSZWNlaXZlIHRoZSByZXNwb25zZSBhbmQgZm9ybSB0aGUgcXVlc3Rpb25zICovXG5mdW5jdGlvbiByZXFMaXN0ZW5lcigpIHtcbiAgdmFyIHBhcnNlZEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KTtcblxuICAvKiBGb3IgcXVlc3Rpb25zIHdpdGhvdXQgY2hvaWNlcyAqL1xuICBpZighdGhpcy5yZXNwb25zZS5pbmNsdWRlcygnYWx0ZXJuYXRpdmVzJykpIHtcblxuICAgIC8vVXNpbmcgdGhlIHRlbXBsYXRlIHdpdGggbm8gYWx0ZXJuYXRpdmVzXG4gICAgdmFyIG5vX2FsdF90ZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub19hbHRlcm5hdGl2ZScpO1xuICAgIHZhciB0ZW1wX2Nsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShub19hbHRfdGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0uYXBwZW5kQ2hpbGQodGVtcF9jbG9uZSk7XG5cbiAgICB2YXIgcXVlc3Rpb25fbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlc3Rpb25fbGFiZWxfbm9fYWx0Jyk7XG4gICAgcXVlc3Rpb25fbGFiZWwuaW5uZXJUZXh0ID0gJ1F1ZXN0aW9uIG51bWJlciAnICsgcGFyc2VkSlNPTlsnaWQnXSArICc6XFxuJyArIHBhcnNlZEpTT05bJ3F1ZXN0aW9uJ107XG5cbiAgICB2YXIgc3VibWl0X2J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXRfYnV0dG9uX25vYWx0Jyk7XG5cbiAgICBzdWJtaXRfYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdmFyIGFuc3dlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyX2Fuc3dlcicpLnZhbHVlO1xuXG4gICAgICAvL01ldGhvZCBjYWxsIHRvIGNyZWF0ZSB0aGUgcG9zdCByZXF1ZXN0XG4gICAgICBjcmVhdGVQb3N0UmVxdWVzdChwYXJzZWRKU09OLCBhbnN3ZXIpO1xuICAgICAgLy9DbGVhciB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgcGFnZSAocHJldmVudHMgb3ZlcmxhcHBlZCB0ZW1wbGF0ZXMpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5yZW1vdmVDaGlsZCh0ZW1wX2Nsb25lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIEZvciBxdWVzdGlvbnMgd2l0aCBjaG9pY2VzICovXG4gIGVsc2Uge1xuICAgIC8vQ2hlY2tpbmcgdGhlIG51bWJlciBvZiBhbHRlcm5hdGl2ZXNcbiAgICB2YXIgYWx0ZXJuYXRpdmVzX251bWJlcjtcbiAgICBpZih0aGlzLnJlc3BvbnNlVGV4dC5pbmNsdWRlcygnYWx0NCcpKVxuICAgICAgYWx0ZXJuYXRpdmVzX251bWJlciA9IDQ7XG4gICAgZWxzZSBhbHRlcm5hdGl2ZXNfbnVtYmVyID0gMztcblxuICAgIC8vVXNpbmcgdGhlIHRlbXBsYXRlIHdpdGggbm8gYWx0ZXJuYXRpdmVzXG4gICAgdmFyIGFsdF90ZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHRlcm5hdGl2ZScpO1xuICAgIHZhciB0ZW1wX2FsdF9jbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoYWx0X3RlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLmFwcGVuZENoaWxkKHRlbXBfYWx0X2Nsb25lKTtcblxuICAgIHZhciBxdWVzdGlvbl9sYWJlbF9hbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlc3Rpb25fbGFiZWxfYWx0Jyk7XG4gICAgcXVlc3Rpb25fbGFiZWxfYWx0LmlubmVyVGV4dCA9ICdRdWVzdGlvbiAnICsgcGFyc2VkSlNPTlsnaWQnXSArICc6IFxcdCcrIHBhcnNlZEpTT05bJ3F1ZXN0aW9uJ107XG5cbiAgICB2YXIgbGFiZWxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGFiZWxzJyk7XG5cbiAgICAvL0FkZGluZyB0aGUgYWx0ZXJuYXRpdmVzIGxhYmVscyB0byB0aGUgcmFkaW8gYnV0dG9uc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWx0ZXJuYXRpdmVzX251bWJlciA7IGkrKykge1xuICAgICAgdmFyIGFsdCA9ICdhbHQnKyAoaSArIDEpO1xuICAgICAgbGFiZWxzW2ldLmlubmVyVGV4dCA9ICBwYXJzZWRKU09OLmFsdGVybmF0aXZlc1thbHRdO1xuICAgIH1cbiAgICAvL0NoZWNrcyBpZiB0aGVyZSBpcyBvbmx5IDMgYWx0ZXJuYXRpdmVzLCB0aGVuIHJlbW92ZSB0aGUgNHRoIHJhZGlvIGJ1dHRvblxuICAgIGlmKGFsdGVybmF0aXZlc19udW1iZXIgPT0gMylcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfaW5zaWRlX3RlbXAnKS5yZW1vdmVDaGlsZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWx0NF9kaXYnKSk7XG5cbiAgICB2YXIgc3VibWl0QW5zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdF9idXR0b25fYWx0Jyk7XG4gICAgdmFyIGFuc3dlcjtcbiAgICBzdWJtaXRBbnMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB2YXIgcmFkaW9CdXR0b25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ2dyb3VwMScpO1xuICAgICAgLy9UbyBjaGVjayB3aGljaCByYWRpbyBidXR0b24gaXMgY2hvc2VuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhZGlvQnV0dG9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgd2hhdCA9IHJhZGlvQnV0dG9uc1tpXTtcbiAgICAgICAgaWYgKHJhZGlvQnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgYW5zd2VyID0gcmFkaW9CdXR0b25zW2ldLmlkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL01ldGhvZCBjYWxsIHRvIGNyZWF0ZSB0aGUgcG9zdCByZXF1ZXN0XG4gICAgICBjcmVhdGVQb3N0UmVxdWVzdChwYXJzZWRKU09OLCBhbnN3ZXIpO1xuICAgICAgLy9DbGVhciB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgcGFnZSAocHJldmVudHMgb3ZlcmxhcHBlZCB0ZW1wbGF0ZXMpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5yZW1vdmVDaGlsZCh0ZW1wX2FsdF9jbG9uZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyogQSBtZXRob2QgdG8gY3JlYXRlIGEgR0VUIHJlcXVlc3Qgd2l0aCB0aGUgc3BlY2lmaWVkICd1cmwnICovXG5mdW5jdGlvbiBjcmVhdGVHZXRSZXF1ZXN0KHVybCkge1xuICB2YXIgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICBvUmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXFMaXN0ZW5lcik7XG4gIG9SZXEub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgb1JlcS5zZW5kKCk7XG59XG5cbi8qIEEgbWV0aG9kIHRvIGNyZWF0ZSBhIFBPU1QgcmVxdWVzdCB3aXRoIHRoZSBzcGVjaWZpZWQgJ2Fuc3dlcicgYW5kICdwYXJzZWRKU09OJyB0byBnZXQgdGhlIG5leHQgdXJsICovXG5mdW5jdGlvbiBjcmVhdGVQb3N0UmVxdWVzdChwYXJzZWRKU09OLCBhbnN3ZXIpIHtcbiAgdmFyIGpzb25PYmplY3QgPSB7XCJhbnN3ZXJcIjphbnN3ZXJ9O1xuICBqc29uT2JqZWN0ID0gSlNPTi5zdHJpbmdpZnkoanNvbk9iamVjdCk7XG5cbiAgdmFyIG9SZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICBvUmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihvUmVxLnJlYWR5U3RhdGUgPT0gNCAmJiBvUmVxLnN0YXR1cyA9PSAyMDAgKSB7XG5cbiAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2Uob1JlcS5yZXNwb25zZVRleHQpO1xuICAgICAgLy9UaGUgcXVpeiBpcyBub3Qgb3ZlclxuICAgICAgaWYocmVzcG9uc2VbJ25leHRVUkwnXSAhPSBudWxsKVxuICAgICAgICBjcmVhdGVHZXRSZXF1ZXN0KHJlc3BvbnNlWyduZXh0VVJMJ10pO1xuICAgICAgLy9UaGUgcXVpeiBpcyBvdmVyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZWxhcHNlZENvdW50ZXIgPSAoRGF0ZS5ub3coKSAtIHBhcnNlSW50KEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnY291bnRlcicpKSkpIC8gMTAwMDtcbiAgICAgICAgcmV0dXJuVG9NYWluKCdDb25ncmF0dWxhdGlvbnMhIFlvdSBoYXZlIGFjZWQgdGhpcyBjcmF6eSBibGF6eSBxdWl6ISAnICsgZWxhcHNlZENvdW50ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZihvUmVxLnJlYWR5U3RhdGUgPT0gNCAmJiBvUmVxLnN0YXR1cyA9PSA0MDAgKSB7XG4gICAgICByZXR1cm5Ub01haW4oJ1lvdSBoYXZlIGFuc3dlcmVkIHdyb25nIG1hdGUgOignICsgICdcXG5UcnkgYWdhaW4hJyk7XG4gICAgfVxuICB9O1xuICBvUmVxLm9wZW4oJ1BPU1QnLCBwYXJzZWRKU09OWyduZXh0VVJMJ10sIHRydWUpO1xuICBvUmVxLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIG9SZXEuc2VuZChqc29uT2JqZWN0KTtcbn1cblxuLypNZXRob2QgdGhhdCB0YWtlcyB0aGUgdXNlciBiYWNrIHRvIHRoZSBtYWluIHBhZ2UgKi9cbmZ1bmN0aW9uIHJldHVyblRvTWFpbihtZXNzYWdlKSB7XG4gIC8vVE9ETzogc3RvcCBjb3VudGVyLCBzYXZlIHNjb3JlIGluIHdlYiBzdG9yYWdlIGFuZCBzaG93IGl0IGluIHRoZSBhbGVydCB3aW5kb3dcbiAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgdmFyIG5pY2tuYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcblxuICBjaGVja0xvY2FsU3RvcmFnZShuaWNrbmFtZSwgZWxhcHNlZENvdW50ZXIpO1xuXG4gIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2luZGV4Lmh0bWwnO1xuICBhbGVydChtZXNzYWdlKTtcbn1cblxuLypBIG1ldGhvZCB0byBzb3J0IHRoZSBoaWdoc2NvcmUgdGFibGUgYWNjb3JkaW5nIHRvIHRoZSB1c2VyIHRpbWUgKi9cbmZ1bmN0aW9uIGNoZWNrTG9jYWxTdG9yYWdlKG5ld05hbWUsIG5ld0hpZ2hzY29yZSkge1xuICBpZihsb2NhbFN0b3JhZ2UubGVuZ3RoICE9IDApIHtcbiAgICB2YXIgbmV3QXJyYXkgPSBbbmV3TmFtZSwgbmV3SGlnaHNjb3JlXTtcbiAgICB2YXIgbmlja25hbWU7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIG9uZVNjb3JlO1xuICAgIHZhciBoaWdoc2NvcmVBcnJheSA9IG5ldyBBcnJheShsb2NhbFN0b3JhZ2UubGVuZ3RoICsgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5pY2tuYW1lID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgIHRpbWUgID0gbG9jYWxTdG9yYWdlW25pY2tuYW1lXTtcbiAgICAgIG9uZVNjb3JlID0gW25pY2tuYW1lLCB0aW1lXTtcbiAgICAgIGhpZ2hzY29yZUFycmF5LnB1c2gob25lU2NvcmUpO1xuICAgIH1cbiAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICBoaWdoc2NvcmVBcnJheS5wdXNoKG5ld0FycmF5KTtcbiAgICAvL1NvcnQgYWNjb3JkaW5nIHRvIHRpbWVcbiAgICBoaWdoc2NvcmVBcnJheS5zb3J0KGZ1bmN0aW9uIChrMSwgazIpIHtcbiAgICAgIHZhciB0aW0xID0gIGsyWzFdO1xuICAgICAgdmFyIHRpbTIgPSAgazFbMV07XG4gICAgICByZXR1cm4gdGltMS0gdGltMjtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaGlnaHNjb3JlQXJyYXkubGVuZ3RoIC8gMjsgaysrKSB7XG4gICAgICBvbmVTY29yZSA9IGhpZ2hzY29yZUFycmF5W2tdO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ob25lU2NvcmVbMF0sIG9uZVNjb3JlWzFdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obmV3TmFtZSwgbmV3SGlnaHNjb3JlKTtcbiAgfVxufVxuIl19
