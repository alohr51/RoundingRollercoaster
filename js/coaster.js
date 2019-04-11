$(document).foundation();

// These relate to the data attribute on the buttons the user clicks
const UP_CHOICE = "up";
const DOWN_CHOICE = "down";
const SAME_CHOICE = "same";

let SCORE_STREAK = 0;
let OPTIONS = {
	minInt: 0,
	maxInt: 99
};

$("document").ready(function(){
	start();
	// initialize score streak
	// TODO: from local storage
	$("#scoreStreak").text(0);
});

$(".button").on("click", e =>{
	let $this = $(e.currentTarget);

	let choice = $this.data("type");
	let answer = getAnswer(choice);
	choice === answer ? showCorrectAnswer() : showIncorrectAnswer();
});

function start(){
	// Set the initial number to round
	let randInt = getRandomIntInclusive(OPTIONS.minInt, OPTIONS.maxInt);
	$("#numDisplay").text(randInt);
}

function showCorrectAnswer(){
	let $display = $("#resultDisplay");
	$display.removeClass();
	$display.addClass("green");
	let num = $("#numDisplay").text();
	let roundedNum = roundNum(parseInt(num));
	$display.text(`Correct! ${num} rounds to ${roundedNum}`);
	incrementScoreStreak();
	start();
}

function showIncorrectAnswer(){
	let $display = $("#resultDisplay");
	$display.removeClass();
	$display.addClass("red");

	// Take away the incorrect message then make it appear ms later to have a "flash"
	// affect so multiple wrong answers in a row are highlighted (otherwise the text
	// just stays the same and the button appears to "do nothing")
	$display.html("&nbsp");
	setTimeout(() => $display.text("Incorrect, try again"), 200);

	resetScoreStreak();
}

function getRandomIntInclusive(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function roundNum(num){
	return Math.round(num / 10) * 10;
}

function getAnswer(){
	let num = $("#numDisplay").text();
	let parsedNum = parseInt(num);
	let roundedNum = roundNum(parsedNum);

	if(parsedNum === roundedNum){
		return SAME_CHOICE;
	}
	else if(parsedNum < roundedNum){
		return UP_CHOICE;
	}
	else if(parsedNum > roundedNum){
		return DOWN_CHOICE;
	}
	else{
		console.error(`unexpected condition with parsedNum ${parsedNum} and roundedNum ${roundedNum}`)
	}
}

function incrementScoreStreak(){
	let $scoreStreak = $("#scoreStreak");
	let currScore = parseInt($scoreStreak.text());
	$scoreStreak.text(++currScore);
}

function resetScoreStreak(){
	$("#scoreStreak").text(0);
}