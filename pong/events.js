function event_resize()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	if (!(player1 == undefined || player2 == undefined || ball == undefined))
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		player1.ypos = (canvas.height / 2) - player1.height / 2;
		player2.ypos = (canvas.height / 2) - player2.height / 2;
		player1.draw();
		player2.draw();
		ball.draw();
	}
}

function event_keydown(e)
{
	if (player1 == undefined || player2 == undefined) return ;
	if (e.key == "w") player1.move_up = true;
	if (e.key == "s") player1.move_down = true;
	if (e.key == "o") player2.move_up = true;
	if (e.key == "l") player2.move_down = true;
}

function event_keyup(e)
{
	if (player1 == undefined || player2 == undefined) return ;
	if (e.key == "w") player1.move_up = false;
	if (e.key == "s") player1.move_down = false;
	if (e.key == "o") player2.move_up = false;
	if (e.key == "l") player2.move_down = false;
}
