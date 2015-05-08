// ==UserScript==
// @name         WK Anki Mode
// @namespace    WKANKIMODE
// @version      0.1
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
 */

/*
 * Changelog
 *
 * 0.1 (7 May 2015)
 *  - Started Working On The script.
 *
 */


// Save the original evaluator
var debugLogEnabled = answerChecker.evaluate;

// For jStorage
$ = unsafeWindow.$;

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
    ");

};

var addButtons = function () {
    var footer = document.getElementsByTagName('footer')[0];

    var ankiModeButton = "<div id='WKANKIMODE_anki' class='WKANKIMODE_button' title='Anki Mode' onclick='WKANKIMODE_toogle();'>Anki Mode</div>";
    var yesButton = "<div id='WKANKIMODE_yes' class='WKANKIMODE_button' title='Correct' onclick='WKANKIMODE_correct();'>Correct</div>";
    var noButton = "<div id='WKANKIMODE_no' class='WKANKIMODE_button' title='Incorrect' onclick='WKANKIMODE_incorrect();'>Incorrect</div>";

    footer.innerHTML = footer.innerHTML + ankiModeButton;
};

var init = function () {
    loadCSS();
    addButtons();
};

// Init the script
window.addEventListener("load", function () {
    init();
});