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

    var questionUrl = 'http://vhost3.lnu.se:20080/question/1';
    createGetRequest(questionUrl);
  }
}, false);

/* Receive the response and form the questions */
function reqListener() {
  console.log('Reply from server: '+ this.responseText);
  var parsedJSON = JSON.parse(this.responseText);

  /* For questions without choices */
  if(!this.response.includes('alternatives')) {
    //Using the template with no alternatives
    var no_alt_template = document.getElementById('no_alternative');
    var temp_clone = document.importNode(no_alt_template.content.firstElementChild, true);
    document.getElementsByClassName('input-field col s6')[0].appendChild(temp_clone);

    var question_label = document.getElementById('question_label_no_alt');
    question_label.innerHTML = 'Question number ' + parsedJSON['id'] + ':\n' + parsedJSON['question'];

    var submit_button = document.getElementById('submit_button_noalt');

    submit_button.addEventListener('click', function (event) {
      var answer = document.getElementById('user_answer').value;

      //Method call to create the post request
      createPostRequest(parsedJSON, answer);
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
    question_label_alt.innerHTML = 'Question ' + parsedJSON['id'] + ': \t'+ parsedJSON['question'];

    var labels = document.getElementsByClassName('labels');

    for (var i = 0; i < alternatives_number ; i++) {
      var alt = 'alt'+ (i + 1);
      //  debugger;
      labels[i].innerText =  parsedJSON.alternatives[alt];
    }
    //Checks if there is only 3 alternatives, then remove the 4th radio button
    if(alternatives_number == 3)
      document.getElementById('div_inside_temp').removeChild(document.getElementById('alt4_div'));

    var submitAns = document.getElementById('submit_button_alt');
    var answer;
    submitAns.addEventListener('click', function (event) {
      var radioButtons = document.getElementsByName('group1');
      for (var i = 0; i < radioButtons.length; i++) {
        var what = radioButtons[i];
        // debugger;
        if (radioButtons[i].checked) {
          answer = radioButtons[i].id;
          break;
        }
      }
      //Method call to create the post request
      createPostRequest(parsedJSON, answer);
      document.getElementsByClassName('input-field col s6')[0].removeChild(temp_alt_clone);
    });
  }
}

function createGetRequest(url) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', reqListener);
  oReq.open('GET', url, true);
  oReq.send();
}

function createPostRequest(parsedJSON, answer) {
  var jsonObject = {"answer":answer};
  jsonObject = JSON.stringify(jsonObject);

  var oReq = new XMLHttpRequest();

  oReq.onreadystatechange = function () {
    console.log('read state: ' + oReq.readyState);
    if(oReq.readyState == 4 && oReq.status == 200 ) {
      console.log(oReq.responseText);
      //debugger;
      var response = JSON.parse(oReq.responseText);
      createGetRequest(response['nextURL']);

    } else if(oReq.readyState == 4 && oReq.status == 400 ) {
      //TODO: stop counter, save score in web storage and show it in the alert window
      window.location.href = 'index.html';
      alert('You have answered wrong mate :(' +  '\nTry again!' + '\nYour score is: '  );
    }
  };
  oReq.open('POST', parsedJSON['nextURL'], true);
  oReq.setRequestHeader('Content-Type', 'application/json');
  oReq.send(jsonObject);
  //   debugger;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjYuNy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIG5pY2tuYW1lIGVudHJ5ICovXG5mdW5jdGlvbiBuaWNrbmFtZSgpIHtcbiAgdmFyIHBhZ2VfdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIGlmICghcGFnZV91cmwuaW5jbHVkZXMoJ3N0YXJ0JykpIHtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZV9idXR0b24nKTtcblxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5pY2tOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25pY2tfbmFtZScpO1xuICAgICAgLy9UT0RPOiBTYXZlIHRoZSB1c2VyIG5pY2tuYW1lIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgbmlja05hbWUudmFsdWUpO1xuICAgICAgY29uc29sZS5sb2coJ3dlbnQgdGhyb3VnaCB0aGUgdGhpbmcnKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlRvIHN0YXJ0IHRoZSBxdWl6IHdpdGggb25seSB0aGUgZmlyc3QgcXVlc3Rpb24qL1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYWdlX3VybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gIC8vQ2hlY2sgaWYgdGhpcyBpcyB0aGUgZmlyc3QgcXVlc3Rpb25cbiAgaWYgKHBhZ2VfdXJsLmluY2x1ZGVzKCdzdGFydC5odG1sP2NvbnRlc3RhbnRfbmFtZScpKSB7XG4gICAgLy9UT0RPOiBHZXQgdGhlIHVzZXIgbmlja25hbWUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgdmFyIHBhcmEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgdmFyIG5pY2sgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSB8fCdEZWZhdWx0IE5pY2tuYW1lJztcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5pY2spO1xuXG4gICAgcGFyYS5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFpbicpWzBdLmFwcGVuZENoaWxkKHBhcmEpO1xuXG4gICAgdmFyIHF1ZXN0aW9uVXJsID0gJ2h0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzEnO1xuICAgIGNyZWF0ZUdldFJlcXVlc3QocXVlc3Rpb25VcmwpO1xuICB9XG59LCBmYWxzZSk7XG5cbi8qIFJlY2VpdmUgdGhlIHJlc3BvbnNlIGFuZCBmb3JtIHRoZSBxdWVzdGlvbnMgKi9cbmZ1bmN0aW9uIHJlcUxpc3RlbmVyKCkge1xuICBjb25zb2xlLmxvZygnUmVwbHkgZnJvbSBzZXJ2ZXI6ICcrIHRoaXMucmVzcG9uc2VUZXh0KTtcbiAgdmFyIHBhcnNlZEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KTtcblxuICAvKiBGb3IgcXVlc3Rpb25zIHdpdGhvdXQgY2hvaWNlcyAqL1xuICBpZighdGhpcy5yZXNwb25zZS5pbmNsdWRlcygnYWx0ZXJuYXRpdmVzJykpIHtcbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBub19hbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9fYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9jbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUobm9fYWx0X3RlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lucHV0LWZpZWxkIGNvbCBzNicpWzBdLmFwcGVuZENoaWxkKHRlbXBfY2xvbmUpO1xuXG4gICAgdmFyIHF1ZXN0aW9uX2xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX25vX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsLmlubmVySFRNTCA9ICdRdWVzdGlvbiBudW1iZXIgJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOlxcbicgKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIHN1Ym1pdF9idXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbl9ub2FsdCcpO1xuXG4gICAgc3VibWl0X2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGFuc3dlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyX2Fuc3dlcicpLnZhbHVlO1xuXG4gICAgICAvL01ldGhvZCBjYWxsIHRvIGNyZWF0ZSB0aGUgcG9zdCByZXF1ZXN0XG4gICAgICBjcmVhdGVQb3N0UmVxdWVzdChwYXJzZWRKU09OLCBhbnN3ZXIpO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9jbG9uZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBGb3IgcXVlc3Rpb25zIHdpdGggY2hvaWNlcyAqL1xuICBlbHNlIHtcbiAgICAvL0NoZWNraW5nIHRoZSBudW1iZXIgb2YgYWx0ZXJuYXRpdmVzXG4gICAgdmFyIGFsdGVybmF0aXZlc19udW1iZXI7XG4gICAgaWYodGhpcy5yZXNwb25zZVRleHQuaW5jbHVkZXMoJ2FsdDQnKSlcbiAgICAgIGFsdGVybmF0aXZlc19udW1iZXIgPSA0O1xuICAgIGVsc2UgYWx0ZXJuYXRpdmVzX251bWJlciA9IDM7XG5cbiAgICAvL1VzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG5vIGFsdGVybmF0aXZlc1xuICAgIHZhciBhbHRfdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWx0ZXJuYXRpdmUnKTtcbiAgICB2YXIgdGVtcF9hbHRfY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGFsdF90ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnB1dC1maWVsZCBjb2wgczYnKVswXS5hcHBlbmRDaGlsZCh0ZW1wX2FsdF9jbG9uZSk7XG5cbiAgICB2YXIgcXVlc3Rpb25fbGFiZWxfYWx0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0aW9uX2xhYmVsX2FsdCcpO1xuICAgIHF1ZXN0aW9uX2xhYmVsX2FsdC5pbm5lckhUTUwgPSAnUXVlc3Rpb24gJyArIHBhcnNlZEpTT05bJ2lkJ10gKyAnOiBcXHQnKyBwYXJzZWRKU09OWydxdWVzdGlvbiddO1xuXG4gICAgdmFyIGxhYmVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xhYmVscycpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbHRlcm5hdGl2ZXNfbnVtYmVyIDsgaSsrKSB7XG4gICAgICB2YXIgYWx0ID0gJ2FsdCcrIChpICsgMSk7XG4gICAgICAvLyAgZGVidWdnZXI7XG4gICAgICBsYWJlbHNbaV0uaW5uZXJUZXh0ID0gIHBhcnNlZEpTT04uYWx0ZXJuYXRpdmVzW2FsdF07XG4gICAgfVxuICAgIC8vQ2hlY2tzIGlmIHRoZXJlIGlzIG9ubHkgMyBhbHRlcm5hdGl2ZXMsIHRoZW4gcmVtb3ZlIHRoZSA0dGggcmFkaW8gYnV0dG9uXG4gICAgaWYoYWx0ZXJuYXRpdmVzX251bWJlciA9PSAzKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9pbnNpZGVfdGVtcCcpLnJlbW92ZUNoaWxkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHQ0X2RpdicpKTtcblxuICAgIHZhciBzdWJtaXRBbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0X2J1dHRvbl9hbHQnKTtcbiAgICB2YXIgYW5zd2VyO1xuICAgIHN1Ym1pdEFucy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIHJhZGlvQnV0dG9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdncm91cDEnKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFkaW9CdXR0b25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB3aGF0ID0gcmFkaW9CdXR0b25zW2ldO1xuICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgaWYgKHJhZGlvQnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgYW5zd2VyID0gcmFkaW9CdXR0b25zW2ldLmlkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL01ldGhvZCBjYWxsIHRvIGNyZWF0ZSB0aGUgcG9zdCByZXF1ZXN0XG4gICAgICBjcmVhdGVQb3N0UmVxdWVzdChwYXJzZWRKU09OLCBhbnN3ZXIpO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaW5wdXQtZmllbGQgY29sIHM2JylbMF0ucmVtb3ZlQ2hpbGQodGVtcF9hbHRfY2xvbmUpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdldFJlcXVlc3QodXJsKSB7XG4gIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlcUxpc3RlbmVyKTtcbiAgb1JlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICBvUmVxLnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zdFJlcXVlc3QocGFyc2VkSlNPTiwgYW5zd2VyKSB7XG4gIHZhciBqc29uT2JqZWN0ID0ge1wiYW5zd2VyXCI6YW5zd2VyfTtcbiAganNvbk9iamVjdCA9IEpTT04uc3RyaW5naWZ5KGpzb25PYmplY3QpO1xuXG4gIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgb1JlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ3JlYWQgc3RhdGU6ICcgKyBvUmVxLnJlYWR5U3RhdGUpO1xuICAgIGlmKG9SZXEucmVhZHlTdGF0ZSA9PSA0ICYmIG9SZXEuc3RhdHVzID09IDIwMCApIHtcbiAgICAgIGNvbnNvbGUubG9nKG9SZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgIC8vZGVidWdnZXI7XG4gICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG9SZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgIGNyZWF0ZUdldFJlcXVlc3QocmVzcG9uc2VbJ25leHRVUkwnXSk7XG5cbiAgICB9IGVsc2UgaWYob1JlcS5yZWFkeVN0YXRlID09IDQgJiYgb1JlcS5zdGF0dXMgPT0gNDAwICkge1xuICAgICAgLy9UT0RPOiBzdG9wIGNvdW50ZXIsIHNhdmUgc2NvcmUgaW4gd2ViIHN0b3JhZ2UgYW5kIHNob3cgaXQgaW4gdGhlIGFsZXJ0IHdpbmRvd1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaW5kZXguaHRtbCc7XG4gICAgICBhbGVydCgnWW91IGhhdmUgYW5zd2VyZWQgd3JvbmcgbWF0ZSA6KCcgKyAgJ1xcblRyeSBhZ2FpbiEnICsgJ1xcbllvdXIgc2NvcmUgaXM6ICcgICk7XG4gICAgfVxuICB9O1xuICBvUmVxLm9wZW4oJ1BPU1QnLCBwYXJzZWRKU09OWyduZXh0VVJMJ10sIHRydWUpO1xuICBvUmVxLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIG9SZXEuc2VuZChqc29uT2JqZWN0KTtcbiAgLy8gICBkZWJ1Z2dlcjtcbn1cblxuIl19
