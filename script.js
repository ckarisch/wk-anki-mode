// ==UserScript==
// @name         WK Anki Mode
// @namespace    WKANKIMODE
// @version      1.0
// @description  Anki mode for Wanikani
// @author       Oleg Grishin <og402@nyu.edu>
// @match        http*://www.wanikani.com/review/session*
// @grant        GM_addStyle
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==

/*
 * WK Anki Mode
 *
 * Often I get tons of reviews piled up and I have to sift through tons and tons of items
 * that I know very well. It takes a long time to type answers in, and sometimes you
 * mistype things accidentally and get discouraged even more. Thus this script removes
 * the need to type answers and simply display them, and mark them as being correct
 * or wrong. It relies solely on one's ability to be honest with themselves and not cheat.
 *
 * Used the following scripts as a reference:
 * http://userscripts-mirror.org/scripts/review/184992
 * https://greasyfork.org/en/scripts/9224-wk-never-wrong
 * https://greasyfork.org/scripts/723-wanikani-stroke-order/code/WaniKani%20Stroke%20Order.user.js
 * https://userscripts.org/scripts/source/174048.user.js
 */

/*
 * Changelog
 *
 * 1.0 (9 May 2015)
 *  - First release.
 *
 * 0.1 (7 May 2015)
 *  - Started Working On The script.
 *
 */


// Save the original evaluator
var originalChecker = answerChecker.evaluate;

var checkerYes = function (itemType, correctValue) {
    return {accurate : !0, passed: !0};
}

var checkerNo = function (itemType, correctValue) {
    return {accurate : !0, passed: 0};
}

var activated = false;
var answerShown = false;

// For jStorage
$ = unsafeWindow.$;

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    $("#user-response").blur();
});

unsafeWindow.WKANKIMODE_toggle = function () {
    if (activated) {
        $("#WKANKIMODE_anki").text("Anki Mode");
        $("#answer-form form button").prop("disabled", false);
        $("#user-response").off("focus");
        $("#user-response").focus();
        activated = false;
        answerChecker.evaluate = originalChecker;
        observer.disconnect();
    } else {
        $("#WKANKIMODE_anki").text("Switch anki mode off");
        $("#answer-form form button").prop("disabled", true);
        $("#user-response").on("focus", function () {
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

unsafeWindow.WKANKIMODE_showAnswer = function () {
    if (!$("#answer-form form fieldset").hasClass("correct") &&
        !$("#answer-form form fieldset").hasClass("incorrect") &&
        !answerShown ) {
        var currentItem = $.jStorage.get("currentItem");
        var questionType = $.jStorage.get("questionType");
        if (questionType === "meaning") {
            var answer = currentItem.en.join(", ");
            if (currentItem.syn.length) {
                answer += " (" + currentItem.syn.join(", ") + ")";
            }
            $("#user-response").val(answer);
        } else {
            if (currentItem.voc) {
                $("#user-response").val(currentItem.kana.join(", "));
            } else if (currentItem.emph == 'kunyomi') {
                $("#user-response").val(currentItem.kun.join(", "));
            } else {
                $("#user-response").val(currentItem.on.join(", "));
            }
        }
        answerShown = true;
    }
};

unsafeWindow.WKANKIMODE_answerYes = function () {
    if (answerShown) {
        answerChecker.evaluate = checkerYes;
        $("#answer-form form button").click();
        // this is here to not break other scripts, i.e. answer override
        answerChecker.evaluate = originalChecker;
        answerShown = false;
        return;
    }

    // if answer is shown, press '1' one more time to go to next
    if ($("#answer-form form fieldset").hasClass("correct") ||
        $("#answer-form form fieldset").hasClass("incorrect") ) {
        $("#answer-form form button").click();
    }

};

unsafeWindow.WKANKIMODE_answerNo = function () {
    if (answerShown) {
        answerChecker.evaluate = checkerNo;
        $("#answer-form form button").click();
        // this is here to not break other scripts, i.e. answer override
        answerChecker.evaluate = originalChecker;
        answerShown = false;
        return;
    }

    if ($("#answer-form form fieldset").hasClass("correct") ||
        $("#answer-form form fieldset").hasClass("incorrect") ) {
        $("#answer-form form button").click();
    }

};

var loadCSS = function () {
    /*jshint multistr: true */
    GM_addStyle("\
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
        #WKANKIMODE_anki.hidden { \
            display: none; \
        } \
    ");
};

var addButtons = function () {

    $("<div />", {
                id : "WKANKIMODE_anki",
                title : "Anki Mode",
    })
    .text("Anki Mode")
    .addClass("WKANKIMODE_button")
    .on("click", WKANKIMODE_toggle)
    .prependTo("footer");

    // TO-DO
    // add physical buttons to press yes/no/show answer

    // var yesButton = "<div id='WKANKIMODE_yes' class='WKANKIMODE_button' title='Correct' onclick='WKANKIMODE_correct();'>Correct</div>";
    // var noButton = "<div id='WKANKIMODE_no' class='WKANKIMODE_button' title='Incorrect' onclick='WKANKIMODE_incorrect();'>Incorrect</div>";

    // $("footer").prepend($(noButton).hide());
    // $("footer").prepend($(yesButton).hide());

};

var bindHotkeys = function () {
    $(document).on("keydown.reviewScreen", function (event)
        {
            if ($("#reviews").is(":visible") && !$("*:focus").is("textarea, input"))
            {
                switch (event.keyCode) {
                    case 32:
                        event.stopPropagation();
                        event.preventDefault();

                        if (activated)
                            unsafeWindow.WKANKIMODE_showAnswer();

                        return;
                        break;
                    case 49:
                        event.stopPropagation();
                        event.preventDefault();

                        if (activated)
                            unsafeWindow.WKANKIMODE_answerYes();

                        return;
                        break;
                    case 50:

                        event.stopPropagation();
                        event.preventDefault();

                        if (activated)
                            unsafeWindow.WKANKIMODE_answerNo();

                        return;
                        break;
                }
            }
        });
};

var init = function () {
    loadCSS();
    addButtons();
    bindHotkeys();
};

// Init the script
$(function(){
    init();
});