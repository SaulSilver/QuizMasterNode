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

    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', reqListener);
    oReq.open('GET', 'http://vhost3.lnu.se:20080/question/1', true);
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
  alert(parsedJSON['question']);
//TODO:on submit button, post the answer to the new url
  var submit_button = document.getElementById('submit_button');

  submit_button.addEventListener('click', function (event) {
    alert("Submission button triggered");
    var answer = document.getElementById('user_answer');

    var jsonObject = {"answer": answer, "content-type": "text"};
    JSON.stringify(jsonObject);
    debugger;
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', reqListener);
    oReq.open('POST', parsedJSON['nextURL'], true);
    oReq.setRequestHeader('Content-type', 'application/json');
    oReq.send(jsonObject);
  })
}
