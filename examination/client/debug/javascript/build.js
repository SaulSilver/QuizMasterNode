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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgbmlja25hbWUgZW50cnkgKi9cbmZ1bmN0aW9uIG5pY2tuYW1lKCkge1xuICB2YXIgcGFnZV91cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgaWYgKCFwYWdlX3VybC5pbmNsdWRlcygnc3RhcnQnKSkge1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmlja19uYW1lX2J1dHRvbicpO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmlja05hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmlja19uYW1lJyk7XG4gICAgICAvL1RPRE86IFNhdmUgdGhlIHVzZXIgbmlja25hbWUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCBuaWNrTmFtZS52YWx1ZSk7XG4gICAgICBjb25zb2xlLmxvZygnd2VudCB0aHJvdWdoIHRoZSB0aGluZycpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qVG8gc3RhcnQgdGhlIHF1aXogd2l0aCBvbmx5IHRoZSBmaXJzdCBxdWVzdGlvbiovXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VfdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgLy9DaGVjayBpZiB0aGlzIGlzIHRoZSBmaXJzdCBxdWVzdGlvblxuICBpZiAocGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0Lmh0bWw/Y29udGVzdGFudF9uYW1lJykpIHtcbiAgICAvL1RPRE86IEdldCB0aGUgdXNlciBuaWNrbmFtZSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICB2YXIgcGFyYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICB2YXIgbmljayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpIHx8J0RlZmF1bHQgTmlja25hbWUnO1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmljayk7XG5cbiAgICBwYXJhLmFwcGVuZENoaWxkKHRleHQpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYWluJylbMF0uYXBwZW5kQ2hpbGQocGFyYSk7XG5cbiAgICB2YXIgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlcUxpc3RlbmVyKTtcbiAgICBvUmVxLm9wZW4oJ0dFVCcsICdodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xJywgdHJ1ZSk7XG4gICAgb1JlcS5zZW5kKCk7XG4gIH1cbn0sIGZhbHNlKTtcblxuLyogUmVjZWl2ZSB0aGUgcmVzcG9uc2UgYW5kIGZvcm0gdGhlIHF1ZXN0aW9ucyAqL1xuZnVuY3Rpb24gcmVxTGlzdGVuZXIoKSB7XG4gIHZhciByZXNwb25zZSA9IHRoaXMucmVzcG9uc2VUZXh0O1xuICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gIHZhciBwYXJzZWRKU09OID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG5cbiAgdmFyIHF1ZXN0aW9uX2xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsJyk7XG4gIHF1ZXN0aW9uX2xhYmVsLmlubmVySFRNTCA9ICdRdWVzdGlvbiBudW1iZXIgJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOlxcbicgKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuICBhbGVydChwYXJzZWRKU09OWydxdWVzdGlvbiddKTtcbi8vVE9ETzpvbiBzdWJtaXQgYnV0dG9uLCBwb3N0IHRoZSBhbnN3ZXIgdG8gdGhlIG5ldyB1cmxcbiAgdmFyIHN1Ym1pdF9idXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbicpO1xuXG4gIHN1Ym1pdF9idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBhbGVydChcIlN1Ym1pc3Npb24gYnV0dG9uIHRyaWdnZXJlZFwiKTtcbiAgICB2YXIgYW5zd2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJfYW5zd2VyJyk7XG5cbiAgICB2YXIganNvbk9iamVjdCA9IHtcImFuc3dlclwiOiBhbnN3ZXIsIFwiY29udGVudC10eXBlXCI6IFwidGV4dFwifTtcbiAgICBKU09OLnN0cmluZ2lmeShqc29uT2JqZWN0KTtcbiAgICBkZWJ1Z2dlcjtcbiAgICB2YXIgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlcUxpc3RlbmVyKTtcbiAgICBvUmVxLm9wZW4oJ1BPU1QnLCBwYXJzZWRKU09OWyduZXh0VVJMJ10sIHRydWUpO1xuICAgIG9SZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICBvUmVxLnNlbmQoanNvbk9iamVjdCk7XG4gIH0pXG59XG4iXX0=
