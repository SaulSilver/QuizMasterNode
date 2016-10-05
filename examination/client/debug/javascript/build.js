(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//The 20 seconds timer variable
//var timer;

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

  //Timer
  var timerText = document.getElementById('timer');
  var start = Date.now();
  //Timeout every 20 seconds. Reset on every question

  var timer = setTimeout(function () {
    returnToMain('Time is up')
  }, 21000);
  //update the text for timer
  var showTimer = setInterval(function () {
    timerText.innerText = (21 - Math.round((Date.now() - start) / 1000));
  }, 1000);

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
      clearInterval(showTimer);
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
      clearInterval(showTimer);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9UaGUgMjAgc2Vjb25kcyB0aW1lciB2YXJpYWJsZVxuLy92YXIgdGltZXI7XG5cbnZhciBwYWdlX3VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuLy8gVGhpcyB3aWxsIG1ha2UgdGhlIG5leHQgYmxvY2sgb2YgY29kZSBnbyBvbmx5IGluIHRoZSB3ZWxjb21lIHBhZ2VcbmlmICghcGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0JykpIHtcbiAgLy9JZiB0aGUgbG9jYWwgc3RvcmFnZSBpc24ndCBlbXB0eSwgZWxzZSBTZXQgdXAgdGhlIGhpZ2hzY29yZSB0YWJsZVxuICBpZihsb2NhbFN0b3JhZ2UubGVuZ3RoICE9IDApIHtcbiAgICB2YXIgaGlnaHNjb3JlQXJyYXkgPSBuZXcgQXJyYXkobG9jYWxTdG9yYWdlLmxlbmd0aCk7XG4gICAgdmFyIG9uZVNjb3JlO1xuICAgIHZhciBuaWNrbmFtZTtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdGFibGVOYW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RhYmxlX3VzZXInKTtcbiAgICB2YXIgdGFibGVUaW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RhYmxlX3RpbWUnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9UYWtlcyB0aGUgdG9wIDUgaGlnaHNjb3JlcyBvbmx5XG4gICAgICBpZihpID09IDUpXG4gICAgICAgIGJyZWFrO1xuICAgICAgbmlja25hbWUgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgdGltZSA9IGxvY2FsU3RvcmFnZVtuaWNrbmFtZV07XG4gICAgICBvbmVTY29yZSA9IFtuaWNrbmFtZSwgdGltZV07XG4gICAgICBoaWdoc2NvcmVBcnJheS5wdXNoKG9uZVNjb3JlKTtcbiAgICB9XG4gICAgLy9hc2NlbmRpbmcgc29ydGluZyBvZiB0aGUgYXJyYXkgYWNjb3JkaW5nIHRvIHRoZSB0aW1pbmdcbiAgICBoaWdoc2NvcmVBcnJheS5zb3J0KGZ1bmN0aW9uIChrMSwgazIpIHtcbiAgICAgIHJldHVybiBrMVsxXS0gazJbMV07XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGhpZ2hzY29yZUFycmF5Lmxlbmd0aCAvIDI7IGsrKykge1xuICAgICAgb25lU2NvcmUgPSBoaWdoc2NvcmVBcnJheVtrXTtcbiAgICAgIHRhYmxlTmFtZXMuaXRlbShrKS5pbm5lclRleHQgPSBvbmVTY29yZVswXTtcbiAgICAgIHRhYmxlVGltZXMuaXRlbShrKS5pbm5lclRleHQgPSBvbmVTY29yZVsxXTtcbiAgICB9XG4gIH1cbiAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduaWNrX25hbWVfYnV0dG9uJyk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NvdW50ZXInLCBKU09OLnN0cmluZ2lmeShEYXRlLm5vdygpKSk7XG4gICAgLy9TYXZlIHRoZSBuaWNrbmFtZSBpbiB0aGUgc2Vzc2lvbiBzdG9yYWdlXG4gICAgdmFyIG5pY2tOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZScpO1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgbmlja05hbWUudmFsdWUgfHwnRGVmYXVsdCBOaWNrbmFtZScpO1xuICB9KTtcbn1cblxuLypUbyBzdGFydCB0aGUgcXVpeiB3aXRoIG9ubHkgdGhlIGZpcnN0IHF1ZXN0aW9uKi9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAvL0NoZWNrIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHF1ZXN0aW9uXG4gIGlmIChwYWdlX3VybC5pbmNsdWRlcygnc3RhcnQuaHRtbD9jb250ZXN0YW50X25hbWUnKSkge1xuXG4gICAgLy9TaG93IG5pY2tuYW1lXG4gICAgdmFyIGhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoMScpWzBdO1xuICAgIHZhciBuaWNrID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcbiAgICBoZWFkZXIuaW5uZXJUZXh0ID0gJ1lvISAnICsgbmljaztcblxuICAgIHZhciBxdWVzdGlvblVybCA9ICdodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xJztcbiAgICAvL1NlbmQgYSBHRVQgcmVxdWVzdCB0byByZXRyaWV2ZSB0aGUgZmlyc3QgcXVlc3Rpb25cbiAgICBjcmVhdGVHZXRSZXF1ZXN0KHF1ZXN0aW9uVXJsKTtcbiAgfVxufSwgZmFsc2UpO1xuXG4vKiBSZWNlaXZlIHRoZSByZXNwb25zZSBhbmQgZm9ybSB0aGUgcXVlc3Rpb25zICovXG5mdW5jdGlvbiByZXFMaXN0ZW5lcigpIHtcbiAgdmFyIHBhcnNlZEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KTtcblxuICAvL1RpbWVyXG4gIHZhciB0aW1lclRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXInKTtcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgLy9UaW1lb3V0IGV2ZXJ5IDIwIHNlY29uZHMuIFJlc2V0IG9uIGV2ZXJ5IHF1ZXN0aW9uXG5cbiAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuVG9NYWluKCdUaW1lIGlzIHVwJylcbiAgfSwgMjEwMDApO1xuICAvL3VwZGF0ZSB0aGUgdGV4dCBmb3IgdGltZXJcbiAgdmFyIHNob3dUaW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICB0aW1lclRleHQuaW5uZXJUZXh0ID0gKDIxIC0gTWF0aC5yb3VuZCgoRGF0ZS5ub3coKSAtIHN0YXJ0KSAvIDEwMDApKTtcbiAgfSwgMTAwMCk7XG5cbiAgLyogRm9yIHF1ZXN0aW9ucyB3aXRob3V0IGNob2ljZXMgKi9cbiAgaWYoIXRoaXMucmVzcG9uc2UuaW5jbHVkZXMoJ2FsdGVybmF0aXZlcycpKSB7XG5cbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBub19hbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9fYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9jbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUobm9fYWx0X3RlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLmFwcGVuZENoaWxkKHRlbXBfY2xvbmUpO1xuXG4gICAgdmFyIHF1ZXN0aW9uX2xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX25vX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsLmlubmVyVGV4dCA9ICdRdWVzdGlvbiBudW1iZXIgJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOlxcbicgKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIHN1Ym1pdF9idXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbl9ub2FsdCcpO1xuXG4gICAgc3VibWl0X2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy9TdG9wIHRoZSB0aW1lciBmb3IgdGhpcyBxdWVzdGlvblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIGNsZWFySW50ZXJ2YWwoc2hvd1RpbWVyKTtcbiAgICAgIHZhciBhbnN3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcl9hbnN3ZXInKS52YWx1ZTtcblxuICAgICAgLy9NZXRob2QgY2FsbCB0byBjcmVhdGUgdGhlIHBvc3QgcmVxdWVzdFxuICAgICAgY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKTtcbiAgICAgIC8vQ2xlYXIgdGhlIHRlbXBsYXRlIGZyb20gdGhlIHBhZ2UgKHByZXZlbnRzIG92ZXJsYXBwZWQgdGVtcGxhdGVzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9jbG9uZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBGb3IgcXVlc3Rpb25zIHdpdGggY2hvaWNlcyAqL1xuICBlbHNlIHtcbiAgICAvL0NoZWNraW5nIHRoZSBudW1iZXIgb2YgYWx0ZXJuYXRpdmVzXG4gICAgdmFyIGFsdGVybmF0aXZlc19udW1iZXI7XG4gICAgaWYodGhpcy5yZXNwb25zZVRleHQuaW5jbHVkZXMoJ2FsdDQnKSlcbiAgICAgIGFsdGVybmF0aXZlc19udW1iZXIgPSA0O1xuICAgIGVsc2UgYWx0ZXJuYXRpdmVzX251bWJlciA9IDM7XG5cbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBhbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9hbHRfY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGFsdF90ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5hcHBlbmRDaGlsZCh0ZW1wX2FsdF9jbG9uZSk7XG5cbiAgICB2YXIgcXVlc3Rpb25fbGFiZWxfYWx0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsX2FsdC5pbm5lclRleHQgPSAnUXVlc3Rpb24gJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOiBcXHQnKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIGxhYmVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xhYmVscycpO1xuXG4gICAgLy9BZGRpbmcgdGhlIGFsdGVybmF0aXZlcyBsYWJlbHMgdG8gdGhlIHJhZGlvIGJ1dHRvbnNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsdGVybmF0aXZlc19udW1iZXIgOyBpKyspIHtcbiAgICAgIHZhciBhbHQgPSAnYWx0JysgKGkgKyAxKTtcbiAgICAgIGxhYmVsc1tpXS5pbm5lclRleHQgPSAgcGFyc2VkSlNPTi5hbHRlcm5hdGl2ZXNbYWx0XTtcbiAgICB9XG4gICAgLy9DaGVja3MgaWYgdGhlcmUgaXMgb25seSAzIGFsdGVybmF0aXZlcywgdGhlbiByZW1vdmUgdGhlIDR0aCByYWRpbyBidXR0b25cbiAgICBpZihhbHRlcm5hdGl2ZXNfbnVtYmVyID09IDMpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2luc2lkZV90ZW1wJykucmVtb3ZlQ2hpbGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsdDRfZGl2JykpO1xuXG4gICAgdmFyIHN1Ym1pdEFucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXRfYnV0dG9uX2FsdCcpO1xuICAgIHZhciBhbnN3ZXI7XG4gICAgc3VibWl0QW5zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgY2xlYXJJbnRlcnZhbChzaG93VGltZXIpO1xuICAgICAgdmFyIHJhZGlvQnV0dG9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdncm91cDEnKTtcbiAgICAgIC8vVG8gY2hlY2sgd2hpY2ggcmFkaW8gYnV0dG9uIGlzIGNob3NlblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYWRpb0J1dHRvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHdoYXQgPSByYWRpb0J1dHRvbnNbaV07XG4gICAgICAgIGlmIChyYWRpb0J1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgIGFuc3dlciA9IHJhZGlvQnV0dG9uc1tpXS5pZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9NZXRob2QgY2FsbCB0byBjcmVhdGUgdGhlIHBvc3QgcmVxdWVzdFxuICAgICAgY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKTtcbiAgICAgIC8vQ2xlYXIgdGhlIHRlbXBsYXRlIGZyb20gdGhlIHBhZ2UgKHByZXZlbnRzIG92ZXJsYXBwZWQgdGVtcGxhdGVzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9hbHRfY2xvbmUpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qIEEgbWV0aG9kIHRvIGNyZWF0ZSBhIEdFVCByZXF1ZXN0IHdpdGggdGhlIHNwZWNpZmllZCAndXJsJyAqL1xuZnVuY3Rpb24gY3JlYXRlR2V0UmVxdWVzdCh1cmwpIHtcbiAgdmFyIG9SZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgb1JlcS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVxTGlzdGVuZXIpO1xuICBvUmVxLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gIG9SZXEuc2VuZCgpO1xufVxuXG4vKiBBIG1ldGhvZCB0byBjcmVhdGUgYSBQT1NUIHJlcXVlc3Qgd2l0aCB0aGUgc3BlY2lmaWVkICdhbnN3ZXInIGFuZCAncGFyc2VkSlNPTicgdG8gZ2V0IHRoZSBuZXh0IHVybCAqL1xuZnVuY3Rpb24gY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKSB7XG4gIHZhciBqc29uT2JqZWN0ID0ge1wiYW5zd2VyXCI6YW5zd2VyfTtcbiAganNvbk9iamVjdCA9IEpTT04uc3RyaW5naWZ5KGpzb25PYmplY3QpO1xuXG4gIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgb1JlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYob1JlcS5yZWFkeVN0YXRlID09IDQgJiYgb1JlcS5zdGF0dXMgPT0gMjAwICkge1xuXG4gICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG9SZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgIC8vVGhlIHF1aXogaXMgbm90IG92ZXJcbiAgICAgIGlmKHJlc3BvbnNlWyduZXh0VVJMJ10gIT0gbnVsbClcbiAgICAgICAgY3JlYXRlR2V0UmVxdWVzdChyZXNwb25zZVsnbmV4dFVSTCddKTtcbiAgICAgIC8vVGhlIHF1aXogaXMgb3ZlclxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBlbGFwc2VkQ291bnRlciA9IChEYXRlLm5vdygpIC0gcGFyc2VJbnQoSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjb3VudGVyJykpKSkgLyAxMDAwO1xuICAgICAgICB2YXIgbmlja25hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShuaWNrbmFtZSwgZWxhcHNlZENvdW50ZXIpO1xuXG4gICAgICAgIHJldHVyblRvTWFpbignQ29uZ3JhdHVsYXRpb25zISBZb3UgaGF2ZSBhY2VkIHRoaXMgY3JhenkgYmxhenkgcXVpeiEgJyArIGVsYXBzZWRDb3VudGVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYob1JlcS5yZWFkeVN0YXRlID09IDQgJiYgb1JlcS5zdGF0dXMgPT0gNDAwICkge1xuICAgICAgcmV0dXJuVG9NYWluKCdZb3UgaGF2ZSBhbnN3ZXJlZCB3cm9uZyBtYXRlIDooJyArICAnXFxuVHJ5IGFnYWluIScpO1xuICAgIH1cbiAgfTtcbiAgb1JlcS5vcGVuKCdQT1NUJywgcGFyc2VkSlNPTlsnbmV4dFVSTCddLCB0cnVlKTtcbiAgb1JlcS5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICBvUmVxLnNlbmQoanNvbk9iamVjdCk7XG59XG5cbi8qTWV0aG9kIHRoYXQgdGFrZXMgdGhlIHVzZXIgYmFjayB0byB0aGUgbWFpbiBwYWdlICovXG5mdW5jdGlvbiByZXR1cm5Ub01haW4obWVzc2FnZSkge1xuICAvL1RPRE86IHN0b3AgY291bnRlciwgc2F2ZSBzY29yZSBpbiB3ZWIgc3RvcmFnZSBhbmQgc2hvdyBpdCBpbiB0aGUgYWxlcnQgd2luZG93XG4gIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaW5kZXguaHRtbCc7XG4gIGFsZXJ0KG1lc3NhZ2UpO1xufVxuIl19
