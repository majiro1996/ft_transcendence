let canvas = document.getElementById("game_display");
let ctx = canvas.getContext("2d");

let player1 = undefined;
let player2 = undefined;
let ball = undefined;

event_resize();
window.onresize = event_resize;
document.addEventListener("keydown", event_keydown);
document.addEventListener("keyup", event_keyup);

player1 = new Player(50, 10, 100, "white", 10);
player2 = new Player(canvas.width - 50, 10, 100, "white", 10);
ball = new Ball(10, "white", 10);

function main_loop()
{
	ctx.font = "40px JetBrains Mono";
	ctx.textAlign = "center";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	player1.move();
	player2.move();

	player1.draw();
	player2.draw();

	ball.move();
	ball.draw();

	ctx.fillText(`${player1.score} : ${player2.score}`, canvas.width / 2, canvas.height / 4);
	requestAnimationFrame(main_loop);
}

main_loop();
