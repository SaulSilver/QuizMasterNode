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
