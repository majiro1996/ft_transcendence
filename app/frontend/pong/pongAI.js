const message = document.getElementById('message');

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

// Difficulty
const difficulty = localStorage.getItem('pongDifficulty') || 'normal';
let steps = 100;
let speed = 7;

// Adjust difficulty
switch (difficulty) {
    case 'easy':
        steps = 25;
        speed = 5;
        break;
    case 'normal':
        steps = 100;
        speed = 7;
        break;
    case 'hard':
        steps = 200;
        speed = 9;
        break;
    case 'extreme':
        steps = 300;
        speed = 12;
        break;
}

// Ball with speed
ball = new Ball(10, "white", speed);

// Create AI
let aiPlayer = new AIPlayer(player2, steps, 100);  // Simulate forward steps (player, steps, time)


function main_loop()
{
    ctx.font = "40px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    DeltaTime();
    counter += delta_time;

    // Update AI
    aiPlayer.update(ball, counter);

    player1.move();
    player2.move();

    player1.draw();
    player2.draw();

    ball.move(false);
    ball.draw();

    // UI: Display scores
    ctx.fillText(`${player1.score} : ${player2.score}`, canvas.width / 2, canvas.height / 4);

    // Check if any player has won (score >= 10)
    if (player1.score >= 10) {
        message.textContent = "Player 1 wins!";
        message.style.display = 'block';
        return;
    } else if (player2.score >= 10) {
        message.textContent = "BOT wins!";
        message.style.display = 'block';
        return;
    }

    requestAnimationFrame(main_loop);
}

main_loop();
