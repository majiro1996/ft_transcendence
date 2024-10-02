const message = document.getElementById('message');
// Game Setup
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
ball = new Ball(10, "white", 12);

winner = "";

function getCookie(cname)
{
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return "";
}

async function send_results()
{
	try
	{
		const response = await fetch("/", {
			method: "POST",
			headers: {
				"X-CSRFToken": getCookie("csrftoken"),
			},
			body: JSON.stringify({
				game_id: getCookie("game_id"),
				results: winner
			}),
		});
	} catch (error){
		console.log(`Error: ${error}`);
	}
}

message.onclick = send_results

function main_loop()
{
	// Screen Refresh
	ctx.font = "40px JetBrains Mono";
	ctx.textAlign = "center";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Game
	player1.move();
	player2.move();

	player1.draw();
	player2.draw();

	ball.move();
	ball.draw();

	// UI
	ctx.fillText(`${player1.score} : ${player2.score}`, canvas.width / 2, canvas.height / 4);

	// Time Calc
	DeltaTime();
	counter += delta_time;
	//console.log(counter / 1000);

	// Check if any player has won (score >= 10)
	if (player1.score >= 10) {
		winner = "player1";
		message.textContent = "Player 1 wins!";
		message.style.display = 'block';
		return;
	} else if (player2.score >= 10) {
		winner = "player2";
		message.textContent = "Player 2 wins!";
		message.style.display = 'block';
		return;
	}
	requestAnimationFrame(main_loop);
}

main_loop();
