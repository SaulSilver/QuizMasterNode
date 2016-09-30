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
