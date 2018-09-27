// ==UserScript==
// @name         Wanikani Anki Mode
// @namespace    ckarisch
// @version      1.9
// @description  Anki mode for Wanikani
// @author       Christof Karisch
// @match        https://www.wanikani.com/review/session*
// @match        http://www.wanikani.com/review/session*
// @grant        none
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==

//Original author: Oleg Grishin <og402@nyu.edu>, Mempo (edited the original script)

console.log('/// Start of Wanikani Anki Mode');


// Save the original evaluator
var originalChecker = answerChecker.evaluate;

var checkerYes = function(itemType, correctValue) {
  return {
    accurate: !0,
    passed: !0
  };
}

var checkerNo = function(itemType, correctValue) {
  return {
    accurate: !0,
    passed: 0
  };
}

var activated = false;
var answerShown = false;

//AUTOSTART
var autostart = false;


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
  $("#user-response").blur();
});

var WKANKIMODE_toggle = function() {

  if (activated) {
    if (autostart) {
      //DISABLE ANKI MODE
      $("#WKANKIMODE_anki").text("Anki Mode Off");
      $("#answer-form form button").prop("disabled", false);
      $("#user-response").off("focus");
      $("#user-response").focus();

      answerChecker.evaluate = originalChecker;
      observer.disconnect();

      localStorage.setItem("WKANKI_autostart", false);
      activated = false;
      autostart = false;
      $("#WKANKIMODE_anki_answer").addClass("hidden");
      console.log("back to #1");


    } else {
      //ENABLE AUTOSTART
      activated = true;
      autostart = true;
      localStorage.setItem("WKANKI_autostart", true);

      $("#WKANKIMODE_anki").text("Anki Mode Auto Start");

      // start observer to force blur
      observer.observe(document.getElementById("answer-form"), {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false
      });

      $("#WKANKIMODE_anki_answer").removeClass("hidden");
    }





  } else {
    //ENABLE ANKI MODE
    $("#WKANKIMODE_anki").text("Anki Mode On");
    $("#answer-form form button").prop("disabled", true);
    $("#user-response").on("focus", function() {
      $("#user-response").blur();
    });
    activated = true;
    autostart = false;
    // start observer to force blur
    observer.observe(document.getElementById("answer-form"), {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false
    });

    $("#WKANKIMODE_anki_answer").removeClass("hidden");
  }

}

var WKANKIMODE_showAnswer = function() {
  if (!$("#answer-form form fieldset").hasClass("correct") &&
    !$("#answer-form form fieldset").hasClass("incorrect") &&
    !answerShown) {
    var currentItem = $.jStorage.get("currentItem");
    var questionType = $.jStorage.get("questionType");
    if (questionType === "meaning") {
      var answerArray = currentItem.en;
      var answerArraySyn = currentItem.syn;
      $("#user-response").val(answerArray[0]);
      $("#WKANKIMODE_anki_answer").val(answerArray.join(", ") +
                                        (answerArraySyn.length > 0 ? " (" + answerArraySyn.join(", ") + ")" : ""));
    } else { //READING QUESTION
      var i = 0;
      var answerArray = [];
      var answerArraySyn = [];
      if (currentItem.voc) {
        for (i = 0; i < (currentItem.kana.length); i++) {
          answerArray.push(currentItem.kana[i]);
        }
      } else if (currentItem.emph == 'kunyomi') {
        for (i = 0; i < (currentItem.kun.length); i++) {
          answerArray.push(currentItem.kun[i]);
        }
      } else if (currentItem.emph == 'nanori') {
        for (i = 0; i < (currentItem.nanori.length); i++) {
          answerArray.push(currentItem.nanori[i]);
        }
      } else {
        for (i = 0; i < (currentItem.on.length); i++) {
          answerArray.push(currentItem.on[i]);
        }
      }
      $("#user-response").val(answerArray[0]);
      $("#WKANKIMODE_anki_answer").val(answerArray.join(", "));
    }
    answerShown = true;
  }
};

var WKANKIMODE_answerYes = function() {
  if (answerShown) {
    answerChecker.evaluate = checkerYes;
    $("#answer-form form button").click();
    answerShown = false;
    answerChecker.evaluate = originalChecker;
    return;
  }

  // if answer is shown, press '1' one more time to go to next
  if ($("#answer-form form fieldset").hasClass("correct") ||
    $("#answer-form form fieldset").hasClass("incorrect")) {
    $("#answer-form form button").click();
    $("#WKANKIMODE_anki_answer").val("");
  }

};

var WKANKIMODE_answerNo = function() {
  if (answerShown) {
    answerChecker.evaluate = checkerNo;
    $("#answer-form form button").click();
    answerShown = false;
    answerChecker.evaluate = originalChecker;
    return;
  }

  if ($("#answer-form form fieldset").hasClass("correct") ||
    $("#answer-form form fieldset").hasClass("incorrect")) {
    $("#answer-form form button").click();
    $("#WKANKIMODE_anki_answer").val("");
  }

};


/*jshint multistr: true */
var css = "\
  #WKANKIMODE_anki_buttongroup { \
    display: flex; \
    justify-content: center; \
  } \
  @media all and (max-width: 767px) { \
    #WKANKIMODE_anki_buttongroup { \
      position: absolute; \
      bottom: 50px; \
      width: 100%; \
    } \
  } \
  @media all and (min-width: 768px) { \
    #WKANKIMODE_anki_correct:after { \
      content: \"(1)\"; \
    } \
    #WKANKIMODE_anki_incorrect:after { \
      content: \"(2)\"; \
    } \
  } \
  #WKANKIMODE_anki_buttongroup > div { \
    min-width: 50px; \
    text-align: center; \
  } \
  #WKANKIMODE_anki { \
    background-color: #000099; \
    margin: 0 5px; \
  } \
  #WKANKIMODE_yes { \
    background-color: #009900; \
    margin: 0 0 0 5px; \
  } \
  #WKANKIMODE_no { \
    background-color: #990000; \
  } \
  .WKANKIMODE_button { \
    display: inline-block; \
    font-size: 0.8125em; \
    color: #FFFFFF; \
    cursor: pointer; \
    padding: 10px; \
  } \
  .incorrect { \
    background-color: #990000; \
  } \
  .correct { \
    background-color: #009900; \
  } \
  .show { \
    background-color: #000099; \
  } \
  #WKANKIMODE_anki.hidden { \
    display: none; \
  } \
  #answer-form input[type=text] { \
    -webkit-box-shadow: 3px 3px 0 rgba(0,0,0,0.1); \
    -moz-box-shadow: 3px 3px 0 rgba(0,0,0,0.1); \
    box-shadow: 3px 3px 0 rgba(0,0,0,0.1); \
  } \
  #answer-form input#WKANKIMODE_anki_answer[type=text] { \
    display: block; \
    position: absolute; \
    left: 10px; \
    top: 50%; \
    width: 100%; \
    width: calc(100% - 66px); \
    padding: 10px; \
    padding-left: 56px; \
    height: 3em; \
    line-height: 3em; \
    transform: translate3d(0, -50%, 0); \
    -webkit-box-shadow: none; \
    -moz-box-shadow: none; \
    box-shadow: none; \
  } \
  #answer-form .correct input#WKANKIMODE_anki_answer[type=text] { \
    background-color: #88cc00; \
  } \
  #answer-form .incorrect input#WKANKIMODE_anki_answer[type=text]  { \
    background-color: #f03; \
    color: #fff; \
  } \
  #answer-form input#WKANKIMODE_anki_answer[type=text].hidden { \
    display: none; \
  }";



function addStyle(aCss) {
  var head, style;
  head = document.getElementsByTagName('head')[0];
  if (head) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = aCss;
    head.appendChild(style);
    return style;
  }
  return null;
}

var addButtons = function() {
  //CHECK AUTOSTART
  autostart = localStorage.getItem('WKANKI_autostart') === "true" ? true : false;

  $("<div />", {
      id: "WKANKIMODE_anki",
      title: "Anki Mode",
    })
    .text("Anki Mode Off")
    .addClass("WKANKIMODE_button")
    .on("click", WKANKIMODE_toggle)
    .prependTo("footer");


  $("<div />", {
      id: "WKANKIMODE_anki_buttongroup",
    })
    .prependTo(".pure-u-1");

  $("<div />", {
      id: "WKANKIMODE_anki_incorrect",
      title: "No",
    })
    .text("Don't know")
    .addClass("WKANKIMODE_button incorrect")
    .on("click", WKANKIMODE_answerNo)
    .prependTo("#WKANKIMODE_anki_buttongroup");

  $("<div />", {
      id: "WKANKIMODE_anki_show",
      title: "Show",
    })
    .text("Show")
    .addClass("WKANKIMODE_button show")
    .on("click", WKANKIMODE_showAnswer)
    .prependTo("#WKANKIMODE_anki_buttongroup");

  $("<div />", {
      id: "WKANKIMODE_anki_correct",
      title: "Yes",
    })
    .text("Know")
    .addClass("WKANKIMODE_button correct")
    .on("click", WKANKIMODE_answerYes)
    .prependTo("#WKANKIMODE_anki_buttongroup");

  // TO-DO
  // add physical buttons to press yes/no/show answer

  // var yesButton = "<div id='WKANKIMODE_yes' class='WKANKIMODE_button' title='Correct' onclick='WKANKIMODE_correct();'>Correct</div>";
  // var noButton = "<div id='WKANKIMODE_no' class='WKANKIMODE_button' title='Incorrect' onclick='WKANKIMODE_incorrect();'>Incorrect</div>";

  // $("footer").prepend($(noButton).hide());
  // $("footer").prepend($(yesButton).hide());

};



var addAnswerOverlay = function() {

  $("<input />", {
      id: "WKANKIMODE_anki_answer",
      type: "text",
      readonly: "readonly",
    })
    .addClass("WKANKIMODE_answer")
    .appendTo("#answer-form fieldset");

};

var autostartFeature = function() {
  console.log("///////////// AUTOSTART: " + autostart);
  if (autostart) {
    $("#WKANKIMODE_anki").text("Anki Mode Auto Start");
    $("#answer-form form button").prop("disabled", true);
    $("#user-response").on("focus", function() {
      $("#user-response").blur();
    });
    activated = true;
    // start observer to force blur
    observer.observe(document.getElementById("answer-form"), {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false
    });
  }
}

var bindHotkeys = function() {
  $(document).on("keydown.reviewScreen", function(event) {
    if ($("#reviews").is(":visible") && !$("*:focus").is("textarea, input")) {
      switch (event.keyCode) {
        case 32:
          event.stopPropagation();
          event.preventDefault();

          if (activated)
            WKANKIMODE_showAnswer();

          return;
          break;
        case 49:
          event.stopPropagation();
          event.preventDefault();

          if (activated)
            WKANKIMODE_answerYes();

          return;
          break;
        case 50:

          event.stopPropagation();
          event.preventDefault();

          if (activated)
            WKANKIMODE_answerNo();

          return;
          break;
      }
    }
  });
};


addStyle(css);
addButtons();
addAnswerOverlay();
autostartFeature();
bindHotkeys();
