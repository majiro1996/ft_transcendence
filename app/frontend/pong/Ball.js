class Ball
{
	constructor(radius, color, speed) {
		this.radius = radius;
		this.color = color;
		this.speed = speed;
		this.xpos = canvas.width / 2;
		this.ypos = canvas.height / 2;

		this.xdir = (Math.random() * (1 - (-1)) + (-1));
		this.ydir = (Math.random() * (1 - (-1)) + (-1));
		let magnitude = Math.sqrt(Math.pow(this.xdir, 2) + Math.pow(this.ydir, 2));
		this.xdir /= magnitude;
		this.ydir /= magnitude;
	}
	draw()
	{
		ctx.beginPath()
		ctx.arc(this.xpos, this.ypos, this.radius, 0, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.closePath()
	}


	#check_wall_collisions(simulation)
	{
		// Calculate where the ball will be
		let final_x = this.xpos + this.xdir * this.speed;
		let final_y = this.ypos + this.ydir * this.speed;

		if (final_y - this.radius <= 0) // Top
		{
			this.ypos = this.radius + 1;
			this.ydir *= -1;
		}
		else if (final_y + this.radius >= canvas.height) // Bottom
		{
			this.ypos = canvas.height - this.radius - 1;
			this.ydir *= -1;
		}

		if (final_x - this.radius <= 0) // Left
		{
			if (simulation==true)
			{
				//If its the simulated ball, ball stops in the x limit
				this.xpos = this.radius + 1;
				this.xdir *= 0;
				this.ydir *= 0;
			}
			else
			{
				player2.score++;
				ball = new Ball(this.radius, this.color, this.speed);
			}
		}
		else if (final_x + this.radius >= canvas.width) // Right
		{
			//If its the simulated ball, ball stops in the x limit
			if (simulation == true)
			{
				this.xpos = canvas.width - this.radius - 1;
				this.xdir *= 0;
				this.ydir *= 0;
			} else {
				player1.score++;
				ball = new Ball(this.radius, this.color, this.speed);
			}
		}
	}

	#check_player_collisions(player)
	{
		if (this.xpos + this.radius > player.xpos &&
			this.xpos - this.radius < player.xpos + player.width &&
			this.ypos + this.radius > player.ypos &&
			this.ypos - this.radius < player.ypos + player.height)
		{
			// Calculate the relative intersect Y position on the paddle
			let relative_intersect_y = (player.ypos + (player.height / 2)) - this.ypos;
			// Normalize the relative intersection Y position (-1 to 1)
			let normalized_relative_intersection_y = (relative_intersect_y / (player.height / 2));
			// Calculate bounce angle (max 75 degrees)
			let bounce_angle = normalized_relative_intersection_y * (75 * Math.PI / 180);
			bounce_angle *= -1;

			// Ensure ball is outside the paddle after collision
			if (this.xdir < 0) // Moving left
				this.xpos = player.xpos + player.width + this.radius;
			else if (this.xdir > 0) // Moving right
				this.xpos = player.xpos - this.radius;

			this.xdir *= -1; // Reverse X direction
			this.ydir = Math.sin(bounce_angle); // New Y direction based on bounce angle

			// Normalize the new direction
			let magnitude = Math.sqrt(Math.pow(this.xdir, 2) + Math.pow(this.ydir, 2));
			this.xdir /= magnitude;
			this.ydir /= magnitude;
		}
	}
	#collisions(simulation)
	{
		// Wall Collisions
		this.#check_wall_collisions(simulation);
		//if is not the simulated ball, check player collisions
		if (!simulation)
		{
			this.#check_player_collisions(player1);
			this.#check_player_collisions(player2);
		}
	}


	//move()
	//{
	//	this.#collisions();
	//	this.xpos += this.xdir * this.speed;
	//	this.ypos += this.ydir * this.speed;
	//}

	move(simulation = false)
	{
		this.#collisions(simulation);
		//this.#collisions();
		this.xpos += this.xdir * this.speed;
		this.ypos += this.ydir * this.speed;
	}
}
