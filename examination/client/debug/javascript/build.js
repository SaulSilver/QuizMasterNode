(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//The 20 seconds timer variable
var timer;

var page_url = window.location.href;
// This will make the next block of code go only in the welcome page
if (!page_url.includes('start')) {
  //If the local storage isn't empty, else Set up the highscore table
  if(localStorage.length != 0) {
    var highscoreArray = new Array(localStorage.length);
    var oneScore;
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
      oneScore = [nickname, time];
      highscoreArray.push(oneScore);
    }
    //ascending sorting of the array according to the timing
    highscoreArray.sort(function (k1, k2) {
      return k1[1]- k2[1];
    });

    for (var k = 0; k < highscoreArray.length / 2; k++) {
      oneScore = highscoreArray[k];
      tableNames.item(k).innerText = oneScore[0];
      tableTimes.item(k).innerText = oneScore[1];
    }
  }
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
  //Check if this is the first question
  if (page_url.includes('start.html?contestant_name')) {
    var timerText = document.getElementById('timer');
    var start = Date.now();
    //Timeout every 20 seconds. Reset on every question
    timer = setTimeout(function () {
      returnToMain('Time is up')
    }, 21000);
    //update the text for timer
    var showTimer = setInterval(function () {
      timerText.innerText = Math.round((Date.now() - start) / 1000) + ' : 20';
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
      //Stop the timer for this question
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
        var elapsedCounter = (Date.now() - parseInt(JSON.parse(sessionStorage.getItem('counter')))) / 1000;
        var nickname = sessionStorage.getItem('username');
        localStorage.setItem(nickname, elapsedCounter);

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

  window.location.href = 'index.html';
  alert(message);
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL1RoZSAyMCBzZWNvbmRzIHRpbWVyIHZhcmlhYmxlXG52YXIgdGltZXI7XG5cbnZhciBwYWdlX3VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuLy8gVGhpcyB3aWxsIG1ha2UgdGhlIG5leHQgYmxvY2sgb2YgY29kZSBnbyBvbmx5IGluIHRoZSB3ZWxjb21lIHBhZ2VcbmlmICghcGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0JykpIHtcbiAgLy9JZiB0aGUgbG9jYWwgc3RvcmFnZSBpc24ndCBlbXB0eSwgZWxzZSBTZXQgdXAgdGhlIGhpZ2hzY29yZSB0YWJsZVxuICBpZihsb2NhbFN0b3JhZ2UubGVuZ3RoICE9IDApIHtcbiAgICB2YXIgaGlnaHNjb3JlQXJyYXkgPSBuZXcgQXJyYXkobG9jYWxTdG9yYWdlLmxlbmd0aCk7XG4gICAgdmFyIG9uZVNjb3JlO1xuICAgIHZhciBuaWNrbmFtZTtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdGFibGVOYW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RhYmxlX3VzZXInKTtcbiAgICB2YXIgdGFibGVUaW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RhYmxlX3RpbWUnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9UYWtlcyB0aGUgdG9wIDUgaGlnaHNjb3JlcyBvbmx5XG4gICAgICBpZihpID09IDUpXG4gICAgICAgIGJyZWFrO1xuICAgICAgbmlja25hbWUgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgdGltZSA9IGxvY2FsU3RvcmFnZVtuaWNrbmFtZV07XG4gICAgICBvbmVTY29yZSA9IFtuaWNrbmFtZSwgdGltZV07XG4gICAgICBoaWdoc2NvcmVBcnJheS5wdXNoKG9uZVNjb3JlKTtcbiAgICB9XG4gICAgLy9hc2NlbmRpbmcgc29ydGluZyBvZiB0aGUgYXJyYXkgYWNjb3JkaW5nIHRvIHRoZSB0aW1pbmdcbiAgICBoaWdoc2NvcmVBcnJheS5zb3J0KGZ1bmN0aW9uIChrMSwgazIpIHtcbiAgICAgIHJldHVybiBrMVsxXS0gazJbMV07XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGhpZ2hzY29yZUFycmF5Lmxlbmd0aCAvIDI7IGsrKykge1xuICAgICAgb25lU2NvcmUgPSBoaWdoc2NvcmVBcnJheVtrXTtcbiAgICAgIHRhYmxlTmFtZXMuaXRlbShrKS5pbm5lclRleHQgPSBvbmVTY29yZVswXTtcbiAgICAgIHRhYmxlVGltZXMuaXRlbShrKS5pbm5lclRleHQgPSBvbmVTY29yZVsxXTtcbiAgICB9XG4gIH1cbiAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduaWNrX25hbWVfYnV0dG9uJyk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NvdW50ZXInLCBKU09OLnN0cmluZ2lmeShEYXRlLm5vdygpKSk7XG4gICAgLy9TYXZlIHRoZSBuaWNrbmFtZSBpbiB0aGUgc2Vzc2lvbiBzdG9yYWdlXG4gICAgdmFyIG5pY2tOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZScpO1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgbmlja05hbWUudmFsdWUgfHwnRGVmYXVsdCBOaWNrbmFtZScpO1xuICB9KTtcbn1cblxuLypUbyBzdGFydCB0aGUgcXVpeiB3aXRoIG9ubHkgdGhlIGZpcnN0IHF1ZXN0aW9uKi9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAvL0NoZWNrIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHF1ZXN0aW9uXG4gIGlmIChwYWdlX3VybC5pbmNsdWRlcygnc3RhcnQuaHRtbD9jb250ZXN0YW50X25hbWUnKSkge1xuICAgIHZhciB0aW1lclRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXInKTtcbiAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIC8vVGltZW91dCBldmVyeSAyMCBzZWNvbmRzLiBSZXNldCBvbiBldmVyeSBxdWVzdGlvblxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm5Ub01haW4oJ1RpbWUgaXMgdXAnKVxuICAgIH0sIDIxMDAwKTtcbiAgICAvL3VwZGF0ZSB0aGUgdGV4dCBmb3IgdGltZXJcbiAgICB2YXIgc2hvd1RpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgdGltZXJUZXh0LmlubmVyVGV4dCA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSBzdGFydCkgLyAxMDAwKSArICcgOiAyMCc7XG4gICAgfSwgMTAwMCk7XG5cbiAgICAvL1Nob3cgbmlja25hbWVcbiAgICB2YXIgaGVhZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2gxJylbMF07XG4gICAgdmFyIG5pY2sgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpO1xuICAgIGhlYWRlci5pbm5lclRleHQgPSAnWW8hICcgKyBuaWNrO1xuXG4gICAgdmFyIHF1ZXN0aW9uVXJsID0gJ2h0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzEnO1xuICAgIC8vU2VuZCBhIEdFVCByZXF1ZXN0IHRvIHJldHJpZXZlIHRoZSBmaXJzdCBxdWVzdGlvblxuICAgIGNyZWF0ZUdldFJlcXVlc3QocXVlc3Rpb25VcmwpO1xuICB9XG59LCBmYWxzZSk7XG5cbi8qIFJlY2VpdmUgdGhlIHJlc3BvbnNlIGFuZCBmb3JtIHRoZSBxdWVzdGlvbnMgKi9cbmZ1bmN0aW9uIHJlcUxpc3RlbmVyKCkge1xuICB2YXIgcGFyc2VkSlNPTiA9IEpTT04ucGFyc2UodGhpcy5yZXNwb25zZVRleHQpO1xuXG4gIC8qIEZvciBxdWVzdGlvbnMgd2l0aG91dCBjaG9pY2VzICovXG4gIGlmKCF0aGlzLnJlc3BvbnNlLmluY2x1ZGVzKCdhbHRlcm5hdGl2ZXMnKSkge1xuXG4gICAgLy9Vc2luZyB0aGUgdGVtcGxhdGUgd2l0aCBubyBhbHRlcm5hdGl2ZXNcbiAgICB2YXIgbm9fYWx0X3RlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vX2FsdGVybmF0aXZlJyk7XG4gICAgdmFyIHRlbXBfY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKG5vX2FsdF90ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5hcHBlbmRDaGlsZCh0ZW1wX2Nsb25lKTtcblxuICAgIHZhciBxdWVzdGlvbl9sYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGlvbl9sYWJlbF9ub19hbHQnKTtcbiAgICBxdWVzdGlvbl9sYWJlbC5pbm5lclRleHQgPSAnUXVlc3Rpb24gbnVtYmVyICcgKyBwYXJzZWRKU09OWydpZCddICsgJzpcXG4nICsgcGFyc2VkSlNPTlsncXVlc3Rpb24nXTtcblxuICAgIHZhciBzdWJtaXRfYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdF9idXR0b25fbm9hbHQnKTtcblxuICAgIHN1Ym1pdF9idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vU3RvcCB0aGUgdGltZXIgZm9yIHRoaXMgcXVlc3Rpb25cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB2YXIgYW5zd2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJfYW5zd2VyJykudmFsdWU7XG5cbiAgICAgIC8vTWV0aG9kIGNhbGwgdG8gY3JlYXRlIHRoZSBwb3N0IHJlcXVlc3RcbiAgICAgIGNyZWF0ZVBvc3RSZXF1ZXN0KHBhcnNlZEpTT04sIGFuc3dlcik7XG4gICAgICAvL0NsZWFyIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBwYWdlIChwcmV2ZW50cyBvdmVybGFwcGVkIHRlbXBsYXRlcylcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLnJlbW92ZUNoaWxkKHRlbXBfY2xvbmUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogRm9yIHF1ZXN0aW9ucyB3aXRoIGNob2ljZXMgKi9cbiAgZWxzZSB7XG4gICAgLy9DaGVja2luZyB0aGUgbnVtYmVyIG9mIGFsdGVybmF0aXZlc1xuICAgIHZhciBhbHRlcm5hdGl2ZXNfbnVtYmVyO1xuICAgIGlmKHRoaXMucmVzcG9uc2VUZXh0LmluY2x1ZGVzKCdhbHQ0JykpXG4gICAgICBhbHRlcm5hdGl2ZXNfbnVtYmVyID0gNDtcbiAgICBlbHNlIGFsdGVybmF0aXZlc19udW1iZXIgPSAzO1xuXG4gICAgLy9Vc2luZyB0aGUgdGVtcGxhdGUgd2l0aCBubyBhbHRlcm5hdGl2ZXNcbiAgICB2YXIgYWx0X3RlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsdGVybmF0aXZlJyk7XG4gICAgdmFyIHRlbXBfYWx0X2Nsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShhbHRfdGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0uYXBwZW5kQ2hpbGQodGVtcF9hbHRfY2xvbmUpO1xuXG4gICAgdmFyIHF1ZXN0aW9uX2xhYmVsX2FsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGlvbl9sYWJlbF9hbHQnKTtcbiAgICBxdWVzdGlvbl9sYWJlbF9hbHQuaW5uZXJUZXh0ID0gJ1F1ZXN0aW9uICcgKyBwYXJzZWRKU09OWydpZCddICsgJzogXFx0JysgcGFyc2VkSlNPTlsncXVlc3Rpb24nXTtcblxuICAgIHZhciBsYWJlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsYWJlbHMnKTtcblxuICAgIC8vQWRkaW5nIHRoZSBhbHRlcm5hdGl2ZXMgbGFiZWxzIHRvIHRoZSByYWRpbyBidXR0b25zXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbHRlcm5hdGl2ZXNfbnVtYmVyIDsgaSsrKSB7XG4gICAgICB2YXIgYWx0ID0gJ2FsdCcrIChpICsgMSk7XG4gICAgICBsYWJlbHNbaV0uaW5uZXJUZXh0ID0gIHBhcnNlZEpTT04uYWx0ZXJuYXRpdmVzW2FsdF07XG4gICAgfVxuICAgIC8vQ2hlY2tzIGlmIHRoZXJlIGlzIG9ubHkgMyBhbHRlcm5hdGl2ZXMsIHRoZW4gcmVtb3ZlIHRoZSA0dGggcmFkaW8gYnV0dG9uXG4gICAgaWYoYWx0ZXJuYXRpdmVzX251bWJlciA9PSAzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9pbnNpZGVfdGVtcCcpLnJlbW92ZUNoaWxkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHQ0X2RpdicpKTtcblxuICAgIHZhciBzdWJtaXRBbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbl9hbHQnKTtcbiAgICB2YXIgYW5zd2VyO1xuICAgIHN1Ym1pdEFucy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHZhciByYWRpb0J1dHRvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgnZ3JvdXAxJyk7XG4gICAgICAvL1RvIGNoZWNrIHdoaWNoIHJhZGlvIGJ1dHRvbiBpcyBjaG9zZW5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFkaW9CdXR0b25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB3aGF0ID0gcmFkaW9CdXR0b25zW2ldO1xuICAgICAgICBpZiAocmFkaW9CdXR0b25zW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICBhbnN3ZXIgPSByYWRpb0J1dHRvbnNbaV0uaWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vTWV0aG9kIGNhbGwgdG8gY3JlYXRlIHRoZSBwb3N0IHJlcXVlc3RcbiAgICAgIGNyZWF0ZVBvc3RSZXF1ZXN0KHBhcnNlZEpTT04sIGFuc3dlcik7XG4gICAgICAvL0NsZWFyIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBwYWdlIChwcmV2ZW50cyBvdmVybGFwcGVkIHRlbXBsYXRlcylcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLnJlbW92ZUNoaWxkKHRlbXBfYWx0X2Nsb25lKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKiBBIG1ldGhvZCB0byBjcmVhdGUgYSBHRVQgcmVxdWVzdCB3aXRoIHRoZSBzcGVjaWZpZWQgJ3VybCcgKi9cbmZ1bmN0aW9uIGNyZWF0ZUdldFJlcXVlc3QodXJsKSB7XG4gIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlcUxpc3RlbmVyKTtcbiAgb1JlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICBvUmVxLnNlbmQoKTtcbn1cblxuLyogQSBtZXRob2QgdG8gY3JlYXRlIGEgUE9TVCByZXF1ZXN0IHdpdGggdGhlIHNwZWNpZmllZCAnYW5zd2VyJyBhbmQgJ3BhcnNlZEpTT04nIHRvIGdldCB0aGUgbmV4dCB1cmwgKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvc3RSZXF1ZXN0KHBhcnNlZEpTT04sIGFuc3dlcikge1xuICB2YXIganNvbk9iamVjdCA9IHtcImFuc3dlclwiOmFuc3dlcn07XG4gIGpzb25PYmplY3QgPSBKU09OLnN0cmluZ2lmeShqc29uT2JqZWN0KTtcblxuICB2YXIgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIG9SZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKG9SZXEucmVhZHlTdGF0ZSA9PSA0ICYmIG9SZXEuc3RhdHVzID09IDIwMCApIHtcblxuICAgICAgdmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShvUmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAvL1RoZSBxdWl6IGlzIG5vdCBvdmVyXG4gICAgICBpZihyZXNwb25zZVsnbmV4dFVSTCddICE9IG51bGwpXG4gICAgICAgIGNyZWF0ZUdldFJlcXVlc3QocmVzcG9uc2VbJ25leHRVUkwnXSk7XG4gICAgICAvL1RoZSBxdWl6IGlzIG92ZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZWxhcHNlZENvdW50ZXIgPSAoRGF0ZS5ub3coKSAtIHBhcnNlSW50KEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnY291bnRlcicpKSkpIC8gMTAwMDtcbiAgICAgICAgdmFyIG5pY2tuYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obmlja25hbWUsIGVsYXBzZWRDb3VudGVyKTtcblxuICAgICAgICByZXR1cm5Ub01haW4oJ0NvbmdyYXR1bGF0aW9ucyEgWW91IGhhdmUgYWNlZCB0aGlzIGNyYXp5IGJsYXp5IHF1aXohICcgKyBlbGFwc2VkQ291bnRlcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmKG9SZXEucmVhZHlTdGF0ZSA9PSA0ICYmIG9SZXEuc3RhdHVzID09IDQwMCApIHtcbiAgICAgIHJldHVyblRvTWFpbignWW91IGhhdmUgYW5zd2VyZWQgd3JvbmcgbWF0ZSA6KCcgKyAgJ1xcblRyeSBhZ2FpbiEnKTtcbiAgICB9XG4gIH07XG4gIG9SZXEub3BlbignUE9TVCcsIHBhcnNlZEpTT05bJ25leHRVUkwnXSwgdHJ1ZSk7XG4gIG9SZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgb1JlcS5zZW5kKGpzb25PYmplY3QpO1xufVxuXG4vKk1ldGhvZCB0aGF0IHRha2VzIHRoZSB1c2VyIGJhY2sgdG8gdGhlIG1haW4gcGFnZSAqL1xuZnVuY3Rpb24gcmV0dXJuVG9NYWluKG1lc3NhZ2UpIHtcbiAgLy9UT0RPOiBzdG9wIGNvdW50ZXIsIHNhdmUgc2NvcmUgaW4gd2ViIHN0b3JhZ2UgYW5kIHNob3cgaXQgaW4gdGhlIGFsZXJ0IHdpbmRvd1xuICBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2luZGV4Lmh0bWwnO1xuICBhbGVydChtZXNzYWdlKTtcbn1cbiJdfQ==
