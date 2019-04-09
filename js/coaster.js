$(document).foundation();

// These relate to the data attribute on the buttons the user clicks
const UP_CHOICE = "up";
const DOWN_CHOICE = "down";
const SAME_CHOICE = "same";


let OPTIONS = {
	minInt: 0,
	maxInt: 99
};

$("document").ready(function(){
	// Set the initial number to round
	let randInt = getRandomIntInclusive(OPTIONS.minInt, OPTIONS.maxInt);
	$("#numDisplay").text(randInt);
});

$(".button").on("click", e =>{
	let $this = $(e.currentTarget);

	let choice = $this.data("type");
	let answer = getAnswer(choice);
	if(choice === answer){
		console.log("yay");
	}
	else{
		console.log("nay")
	}
});

function getRandomIntInclusive(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function getAnswer(){
	let num = $("#numDisplay").text();
	let parsedNum = parseInt(num);
	let roundedNum = Math.round(parsedNum / 10) * 10;

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