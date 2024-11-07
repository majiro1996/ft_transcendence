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

p_winner = "";

async function send_results()
{
	if (!isTournament)
	{
		window.location.hash = "#";
		return;
	}
	try
	{
		const response = await fetch(apiurl + "/set-match-result/", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			},
			body: JSON.stringify({
				user1: localStorage.getItem("user1"),
				user2: localStorage.getItem("user2"),
				winner: p_winner,
				game_type: "pong",
				user1_score: player1.score,
				user2_score: player2.score,
			}),
		});
	} catch (error){
		console.log(`Error: ${error}`);
	}
	window.location.hash = "#tournaments";
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
		p_winner = "player1";
		message.textContent = "Player 1 wins!";
		message.style.display = 'block';
		return;
	} else if (player2.score >= 10) {
		p_winner = "player2";
		message.textContent = "Player 2 wins!";
		message.style.display = 'block';
		return;
	}
	requestAnimationFrame(main_loop);
}

main_loop();
