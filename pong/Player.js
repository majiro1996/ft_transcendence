class Player
{
	constructor(xpos, width, height, color, speed, score)
	{
		this.xpos = xpos;
		this.width = width;
		this.height = height;
		this.color = color;
		this.speed = speed;
		this.ypos = (canvas.height / 2) - this.height / 2;
		this.move_up = false;
		this.move_down = false;
		this.score = 0;
	}
	draw()
	{
		ctx.fillRect(this.xpos, this.ypos, this.width, this.height)
		ctx.fillStyle = this.color
	}
	move()
	{
		if (this.move_up == true && this.move_down == true)
			return;
		if (this.move_up == true && this.ypos > 0)
			this.ypos -= this.speed;
		else if (this.move_down == true && this.ypos + this.height < canvas.height)
			this.ypos += this.speed;
	}
}
