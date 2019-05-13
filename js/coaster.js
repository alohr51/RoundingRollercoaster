$(document).foundation();

// These relate to the data attribute on the buttons the user clicks
const UP_CHOICE = "up";
const DOWN_CHOICE = "down";
const SAME_CHOICE = "same";
const CANVAS_HEIGHT = 350;
const CANVAS_WIDTH = $("#canvasContainer").width();

let OPTIONS = {
	minInt: 0,
	maxInt: 99
};

// Points used to create the bezier curve coaster track
const downhillPoints = {
	start: {x: 0, y: 20},
 	cp1: {x: CANVAS_WIDTH * .25, y: 50},
 	cp2: {x: CANVAS_WIDTH * .5, y: CANVAS_HEIGHT},
 	end: {x: CANVAS_WIDTH, y: CANVAS_HEIGHT},
};

const uphillPoints = {
	start: {x: 0, y: CANVAS_HEIGHT},
	cp1: {x: CANVAS_WIDTH * .25, y: CANVAS_HEIGHT},
	cp2: {x: CANVAS_WIDTH  * .5, y: 0},
	end: {x: CANVAS_WIDTH, y: 0},
};

// canvas and animation
const canvas = document.getElementById("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d");

let percent = 0;
let doAnimate = true;

const fps = 10;
const coasterWidth = 80;
const coasterHeight = 30;
const wheel1 = {x: coasterWidth / 4, y: coasterHeight };
const wheel2 = {x: coasterWidth / 1.2, y: coasterHeight };

$("document").ready(function(){
	init();
	// initialize score streak
	// TODO: from local storage
	$("#scoreStreak").text(0);
});

$(".button").on("click", e =>{
	let $this = $(e.currentTarget);

	let choice = $this.data("type");
	let answer = getAnswer();
	choice === answer ? showCorrectAnswer(answer) : showIncorrectAnswer();
});

function init(){
	// Set the initial number to round
	let randInt = getRandomIntInclusive(OPTIONS.minInt, OPTIONS.maxInt);
	$("#numDisplay").text(randInt);
}

function showCorrectAnswer(answer){
	let $display = $("#resultDisplay");
	$display.removeClass();
	$display.addClass("green");

	let num = $("#numDisplay").text();
	let roundedNum = roundNum(parseInt(num));
	$display.text(`Correct! ${num} rounds to ${roundedNum}`);
	incrementScoreStreak();
	playFanFare(answer);

	init();
}

// Do all sounds and animations for a successful guess
function playFanFare(answer){
	if(answer === SAME_CHOICE){
		//no animation for same choice
		return;
	}

	// reset any currently running animation
	doAnimate = false;
	setTimeout(() => {
		doAnimate = true;
		animate(answer === UP_CHOICE);
	}, 100);
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

function animate(doUphill) {
	if(!doAnimate){
		doAnimate = true;
		percent = 0;
		return;
	}

	let pointSet = doUphill ? uphillPoints : downhillPoints;

	draw(doUphill, pointSet, percent++);

	// request another frame
	setTimeout(function () {
		requestAnimationFrame(() => animate(doUphill));
	}, 1000 / fps);
}

// draw the current frame based on sliderValue
function draw(doUphill, points, sliderValue) {

	// clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 6;

	// Draw the down track using Cubic Bezier curve
	ctx.beginPath();
	ctx.moveTo(points.start.x, points.start.y);
	ctx.bezierCurveTo(points.cp1.x, points.cp1.y, points.cp2.x, points.cp2.y, points.end.x, points.end.y);
	ctx.stroke();

	// raise the coaster up above the track so the wheels are touching it
	let offset = -(coasterHeight + (wheel1.y / 2));
	let t = (sliderValue - 10) / 20;

	let bezierPoint = getQuadraticBezierXYatT(
		{
			x: points.start.x,
			y: points.start.y + offset
		},
		{
			x: points.cp1.x,
			y: points.cp1.y + offset
		},
		{
			x: points.cp2.x,
			y: points.cp2.y + offset
		},
		{
			x: points.end.x,
			y: points.end.y + offset
		}, t);

	// draw the coaster cart and wheels
	drawCoaster(doUphill, points, bezierPoint);
}

function drawCoaster(doUphill, points, bezierPoint) {
	ctx.save();
	ctx.fillStyle = "cyan";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 4;

	ctx.translate(bezierPoint.x, bezierPoint.y);

	// When the coaster will rotate downward will be right as the curve dips and then back to normal
	// (no rotation) when the track evens out at the end
	if((bezierPoint.x > points.cp1.x / 4) && (bezierPoint.x < points.cp2.x * 1.45)) {
		let rotationNum = CANVAS_WIDTH < 400 ? 55 : 25;
		let rotation = doUphill ? -(rotationNum) : rotationNum;
		ctx.rotate(rotation * Math.PI / 180);
	}

	let coasterHalfWidth = coasterWidth / 2;

	// coaster cart
	ctx.fillRect(0 , 0, coasterWidth, coasterHeight);
	ctx.strokeRect(0 , 0, coasterWidth, coasterHeight);

	// rear wheel
	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.arc(wheel1.x, wheel1.y, 10, 0, 2 * Math.PI);
	ctx.stroke();

	// front wheel
	ctx.arc(wheel2.x, wheel2.y, 10, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();

	// stick body
	ctx.beginPath();
	ctx.moveTo(coasterHalfWidth, coasterHeight - 30);
	ctx.lineTo(coasterHalfWidth, coasterHeight - 70);
	ctx.stroke();

	// head
	ctx.beginPath();
	ctx.arc(coasterHalfWidth, coasterHeight - 78, 10, 0, 2 * Math.PI);
	ctx.stroke();

	// right arm
	ctx.beginPath();
	ctx.moveTo(coasterHalfWidth, coasterHeight - 45	);
	ctx.lineTo(coasterHalfWidth + 25, coasterHeight - 60);
	ctx.stroke();

	// left arm
	ctx.beginPath();
	ctx.moveTo(coasterHalfWidth, coasterHeight - 45);
	ctx.lineTo(coasterHalfWidth - 25, coasterHeight - 60);
	ctx.stroke();


	ctx.restore();

	// stop requesting animation frames once the coaster rides off canvas
	if(bezierPoint.x > CANVAS_WIDTH){
		doAnimate = false;
	}
}

// 4 point Bezier curve calculation
// P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
function getQuadraticBezierXYatT(startPt, controlPt, controlPt2, endPt, t) {
	let x = Math.pow(1 - t, 3) * startPt.x + 3 * Math.pow(1 - t, 2) * t * controlPt.x + 3 *(1-t) * Math.pow(t,2) * controlPt2.x +  Math.pow(t, 3) * endPt.x;
	let y = Math.pow(1 - t, 3) * startPt.y + 3 * Math.pow(1 - t, 2) * t * controlPt.y + 3 *(1-t) * Math.pow(t,2) * controlPt2.y +  Math.pow(t, 3) * endPt.y;
	return ({x, y});
}