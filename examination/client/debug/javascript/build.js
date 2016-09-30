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
    timer = setTimeout(function () {
      returnToMain('Time is up')
    }, 20000);
    // TODO: update the text for timer
    // var showTimer = setInterval(function () {
    //   timerText.innerText = timer.getTime();
    // }, 1000);

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
    highscoreArray.sort(function (k1, k2) {
      var tim1 =  k2[1];
      var tim2 =  k1[1];
      return tim1- tim2;
    });

    for (var k = 0; k < highscoreArray.length / 2; k++) {
      oneScore = highscoreArray[k];
      localStorage.setItem(oneScore[0], oneScore[1].toString());
    }
  } else {
    localStorage.setItem(newName, newHighscore);
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB0aW1lcjtcbnZhciBlbGFwc2VkQ291bnRlcjtcblxuLy9JZiB0aGUgbG9jYWwgc3RvcmFnZSBpc24ndCBlbXB0eSwgZWxzZSBTZXQgdXAgdGhlIGhpZ2hzY29yZSB0YWJsZVxuaWYobG9jYWxTdG9yYWdlLmxlbmd0aCAhPSAwKSB7XG4gIHZhciBuaWNrbmFtZTtcbiAgdmFyIHRpbWU7XG4gIHZhciB0YWJsZU5hbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGFibGVfdXNlcicpO1xuICB2YXIgdGFibGVUaW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RhYmxlX3RpbWUnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICBpZihpID09IDUpXG4gICAgICBicmVhaztcbiAgICBuaWNrbmFtZSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgdGltZSA9IGxvY2FsU3RvcmFnZVtuaWNrbmFtZV07XG4gICAgdmFyIG5hbWUgPSB0YWJsZU5hbWVzLml0ZW0oaSk7XG4gICAgbmFtZS5pbm5lclRleHQgPSBuaWNrbmFtZTtcbiAgICB2YXIgdGltZTEgPSB0YWJsZVRpbWVzLml0ZW0oaSk7XG4gICAgdGltZTEuaW5uZXJUZXh0ID0gdGltZTtcbiAgfVxufVxuXG52YXIgcGFnZV91cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbi8vIFRoaXMgd2lsbCBtYWtlIHRoZSBuZXh0IGJsb2NrIG9mIGNvZGUgZ28gb25seSBpbiB0aGUgd2VsY29tZSBwYWdlXG5pZiAoIXBhZ2VfdXJsLmluY2x1ZGVzKCdzdGFydCcpKSB7XG4gIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmlja19uYW1lX2J1dHRvbicpO1xuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdjb3VudGVyJywgSlNPTi5zdHJpbmdpZnkoRGF0ZS5ub3coKSkpO1xuICAgIC8vU2F2ZSB0aGUgbmlja25hbWUgaW4gdGhlIHNlc3Npb24gc3RvcmFnZVxuICAgIHZhciBuaWNrTmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduaWNrX25hbWUnKTtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIG5pY2tOYW1lLnZhbHVlIHx8J0RlZmF1bHQgTmlja25hbWUnKTtcbiAgfSk7XG59XG5cbi8qVG8gc3RhcnQgdGhlIHF1aXogd2l0aCBvbmx5IHRoZSBmaXJzdCBxdWVzdGlvbiovXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VfdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgLy9DaGVjayBpZiB0aGlzIGlzIHRoZSBmaXJzdCBxdWVzdGlvblxuICBpZiAocGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0Lmh0bWw/Y29udGVzdGFudF9uYW1lJykpIHtcbiAgICB2YXIgdGltZXJUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyJyk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVyblRvTWFpbignVGltZSBpcyB1cCcpXG4gICAgfSwgMjAwMDApO1xuICAgIC8vIFRPRE86IHVwZGF0ZSB0aGUgdGV4dCBmb3IgdGltZXJcbiAgICAvLyB2YXIgc2hvd1RpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgdGltZXJUZXh0LmlubmVyVGV4dCA9IHRpbWVyLmdldFRpbWUoKTtcbiAgICAvLyB9LCAxMDAwKTtcblxuICAgIC8vU2hvdyBuaWNrbmFtZVxuICAgIHZhciBoZWFkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDEnKVswXTtcbiAgICB2YXIgbmljayA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJyk7XG4gICAgaGVhZGVyLmlubmVyVGV4dCA9ICdZbyEgJyArIG5pY2s7XG5cbiAgICB2YXIgcXVlc3Rpb25VcmwgPSAnaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMSc7XG4gICAgLy9TZW5kIGEgR0VUIHJlcXVlc3QgdG8gcmV0cmlldmUgdGhlIGZpcnN0IHF1ZXN0aW9uXG4gICAgY3JlYXRlR2V0UmVxdWVzdChxdWVzdGlvblVybCk7XG4gIH1cbn0sIGZhbHNlKTtcblxuLyogUmVjZWl2ZSB0aGUgcmVzcG9uc2UgYW5kIGZvcm0gdGhlIHF1ZXN0aW9ucyAqL1xuZnVuY3Rpb24gcmVxTGlzdGVuZXIoKSB7XG4gIHZhciBwYXJzZWRKU09OID0gSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlVGV4dCk7XG5cbiAgLyogRm9yIHF1ZXN0aW9ucyB3aXRob3V0IGNob2ljZXMgKi9cbiAgaWYoIXRoaXMucmVzcG9uc2UuaW5jbHVkZXMoJ2FsdGVybmF0aXZlcycpKSB7XG5cbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBub19hbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9fYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9jbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUobm9fYWx0X3RlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLmFwcGVuZENoaWxkKHRlbXBfY2xvbmUpO1xuXG4gICAgdmFyIHF1ZXN0aW9uX2xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX25vX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsLmlubmVyVGV4dCA9ICdRdWVzdGlvbiBudW1iZXIgJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOlxcbicgKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIHN1Ym1pdF9idXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbl9ub2FsdCcpO1xuXG4gICAgc3VibWl0X2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHZhciBhbnN3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcl9hbnN3ZXInKS52YWx1ZTtcblxuICAgICAgLy9NZXRob2QgY2FsbCB0byBjcmVhdGUgdGhlIHBvc3QgcmVxdWVzdFxuICAgICAgY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKTtcbiAgICAgIC8vQ2xlYXIgdGhlIHRlbXBsYXRlIGZyb20gdGhlIHBhZ2UgKHByZXZlbnRzIG92ZXJsYXBwZWQgdGVtcGxhdGVzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9jbG9uZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBGb3IgcXVlc3Rpb25zIHdpdGggY2hvaWNlcyAqL1xuICBlbHNlIHtcbiAgICAvL0NoZWNraW5nIHRoZSBudW1iZXIgb2YgYWx0ZXJuYXRpdmVzXG4gICAgdmFyIGFsdGVybmF0aXZlc19udW1iZXI7XG4gICAgaWYodGhpcy5yZXNwb25zZVRleHQuaW5jbHVkZXMoJ2FsdDQnKSlcbiAgICAgIGFsdGVybmF0aXZlc19udW1iZXIgPSA0O1xuICAgIGVsc2UgYWx0ZXJuYXRpdmVzX251bWJlciA9IDM7XG5cbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBhbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9hbHRfY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGFsdF90ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5hcHBlbmRDaGlsZCh0ZW1wX2FsdF9jbG9uZSk7XG5cbiAgICB2YXIgcXVlc3Rpb25fbGFiZWxfYWx0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsX2FsdC5pbm5lclRleHQgPSAnUXVlc3Rpb24gJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOiBcXHQnKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIGxhYmVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xhYmVscycpO1xuXG4gICAgLy9BZGRpbmcgdGhlIGFsdGVybmF0aXZlcyBsYWJlbHMgdG8gdGhlIHJhZGlvIGJ1dHRvbnNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsdGVybmF0aXZlc19udW1iZXIgOyBpKyspIHtcbiAgICAgIHZhciBhbHQgPSAnYWx0JysgKGkgKyAxKTtcbiAgICAgIGxhYmVsc1tpXS5pbm5lclRleHQgPSAgcGFyc2VkSlNPTi5hbHRlcm5hdGl2ZXNbYWx0XTtcbiAgICB9XG4gICAgLy9DaGVja3MgaWYgdGhlcmUgaXMgb25seSAzIGFsdGVybmF0aXZlcywgdGhlbiByZW1vdmUgdGhlIDR0aCByYWRpbyBidXR0b25cbiAgICBpZihhbHRlcm5hdGl2ZXNfbnVtYmVyID09IDMpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2luc2lkZV90ZW1wJykucmVtb3ZlQ2hpbGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsdDRfZGl2JykpO1xuXG4gICAgdmFyIHN1Ym1pdEFucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXRfYnV0dG9uX2FsdCcpO1xuICAgIHZhciBhbnN3ZXI7XG4gICAgc3VibWl0QW5zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdmFyIHJhZGlvQnV0dG9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdncm91cDEnKTtcbiAgICAgIC8vVG8gY2hlY2sgd2hpY2ggcmFkaW8gYnV0dG9uIGlzIGNob3NlblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYWRpb0J1dHRvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHdoYXQgPSByYWRpb0J1dHRvbnNbaV07XG4gICAgICAgIGlmIChyYWRpb0J1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgIGFuc3dlciA9IHJhZGlvQnV0dG9uc1tpXS5pZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9NZXRob2QgY2FsbCB0byBjcmVhdGUgdGhlIHBvc3QgcmVxdWVzdFxuICAgICAgY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKTtcbiAgICAgIC8vQ2xlYXIgdGhlIHRlbXBsYXRlIGZyb20gdGhlIHBhZ2UgKHByZXZlbnRzIG92ZXJsYXBwZWQgdGVtcGxhdGVzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9hbHRfY2xvbmUpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qIEEgbWV0aG9kIHRvIGNyZWF0ZSBhIEdFVCByZXF1ZXN0IHdpdGggdGhlIHNwZWNpZmllZCAndXJsJyAqL1xuZnVuY3Rpb24gY3JlYXRlR2V0UmVxdWVzdCh1cmwpIHtcbiAgdmFyIG9SZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgb1JlcS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVxTGlzdGVuZXIpO1xuICBvUmVxLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gIG9SZXEuc2VuZCgpO1xufVxuXG4vKiBBIG1ldGhvZCB0byBjcmVhdGUgYSBQT1NUIHJlcXVlc3Qgd2l0aCB0aGUgc3BlY2lmaWVkICdhbnN3ZXInIGFuZCAncGFyc2VkSlNPTicgdG8gZ2V0IHRoZSBuZXh0IHVybCAqL1xuZnVuY3Rpb24gY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKSB7XG4gIHZhciBqc29uT2JqZWN0ID0ge1wiYW5zd2VyXCI6YW5zd2VyfTtcbiAganNvbk9iamVjdCA9IEpTT04uc3RyaW5naWZ5KGpzb25PYmplY3QpO1xuXG4gIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgb1JlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYob1JlcS5yZWFkeVN0YXRlID09IDQgJiYgb1JlcS5zdGF0dXMgPT0gMjAwICkge1xuXG4gICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG9SZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgIC8vVGhlIHF1aXogaXMgbm90IG92ZXJcbiAgICAgIGlmKHJlc3BvbnNlWyduZXh0VVJMJ10gIT0gbnVsbClcbiAgICAgICAgY3JlYXRlR2V0UmVxdWVzdChyZXNwb25zZVsnbmV4dFVSTCddKTtcbiAgICAgIC8vVGhlIHF1aXogaXMgb3ZlclxuICAgICAgZWxzZSB7XG4gICAgICAgIGVsYXBzZWRDb3VudGVyID0gKERhdGUubm93KCkgLSBwYXJzZUludChKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2NvdW50ZXInKSkpKSAvIDEwMDA7XG4gICAgICAgIHJldHVyblRvTWFpbignQ29uZ3JhdHVsYXRpb25zISBZb3UgaGF2ZSBhY2VkIHRoaXMgY3JhenkgYmxhenkgcXVpeiEgJyArIGVsYXBzZWRDb3VudGVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYob1JlcS5yZWFkeVN0YXRlID09IDQgJiYgb1JlcS5zdGF0dXMgPT0gNDAwICkge1xuICAgICAgcmV0dXJuVG9NYWluKCdZb3UgaGF2ZSBhbnN3ZXJlZCB3cm9uZyBtYXRlIDooJyArICAnXFxuVHJ5IGFnYWluIScpO1xuICAgIH1cbiAgfTtcbiAgb1JlcS5vcGVuKCdQT1NUJywgcGFyc2VkSlNPTlsnbmV4dFVSTCddLCB0cnVlKTtcbiAgb1JlcS5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICBvUmVxLnNlbmQoanNvbk9iamVjdCk7XG59XG5cbi8qTWV0aG9kIHRoYXQgdGFrZXMgdGhlIHVzZXIgYmFjayB0byB0aGUgbWFpbiBwYWdlICovXG5mdW5jdGlvbiByZXR1cm5Ub01haW4obWVzc2FnZSkge1xuICAvL1RPRE86IHN0b3AgY291bnRlciwgc2F2ZSBzY29yZSBpbiB3ZWIgc3RvcmFnZSBhbmQgc2hvdyBpdCBpbiB0aGUgYWxlcnQgd2luZG93XG4gIGNsZWFyVGltZW91dCh0aW1lcik7XG4gIHZhciBuaWNrbmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJyk7XG5cbiAgY2hlY2tMb2NhbFN0b3JhZ2Uobmlja25hbWUsIGVsYXBzZWRDb3VudGVyKTtcblxuICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdpbmRleC5odG1sJztcbiAgYWxlcnQobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrTG9jYWxTdG9yYWdlKG5ld05hbWUsIG5ld0hpZ2hzY29yZSkge1xuICBpZihsb2NhbFN0b3JhZ2UubGVuZ3RoICE9IDApIHtcbiAgICB2YXIgbmV3QXJyYXkgPSBbbmV3TmFtZSwgbmV3SGlnaHNjb3JlXTtcbiAgICB2YXIgbmlja25hbWU7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIG9uZVNjb3JlO1xuICAgIHZhciBoaWdoc2NvcmVBcnJheSA9IG5ldyBBcnJheShsb2NhbFN0b3JhZ2UubGVuZ3RoICsgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5pY2tuYW1lID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgIHRpbWUgID0gbG9jYWxTdG9yYWdlW25pY2tuYW1lXTtcbiAgICAgIG9uZVNjb3JlID0gW25pY2tuYW1lLCB0aW1lXTtcbiAgICAgIGhpZ2hzY29yZUFycmF5LnB1c2gob25lU2NvcmUpO1xuICAgIH1cbiAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICBoaWdoc2NvcmVBcnJheS5wdXNoKG5ld0FycmF5KTtcbiAgICBoaWdoc2NvcmVBcnJheS5zb3J0KGZ1bmN0aW9uIChrMSwgazIpIHtcbiAgICAgIHZhciB0aW0xID0gIGsyWzFdO1xuICAgICAgdmFyIHRpbTIgPSAgazFbMV07XG4gICAgICByZXR1cm4gdGltMS0gdGltMjtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaGlnaHNjb3JlQXJyYXkubGVuZ3RoIC8gMjsgaysrKSB7XG4gICAgICBvbmVTY29yZSA9IGhpZ2hzY29yZUFycmF5W2tdO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ob25lU2NvcmVbMF0sIG9uZVNjb3JlWzFdLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShuZXdOYW1lLCBuZXdIaWdoc2NvcmUpO1xuICB9XG59XG4iXX0=
