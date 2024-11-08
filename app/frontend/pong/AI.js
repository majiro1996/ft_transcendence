class AIPlayer
{
    constructor(player, predictionSteps, predictionInterval)
    {
        this.player = player;
        this.predictionSteps = predictionSteps;  // Number of steps forward
        this.predictionInterval = predictionInterval; // ms between predictions
        this.targetY = player.ypos;  // Pos Y objective
        this.viewInterval = 1000;  // 1 second
        this.lastUpdate = 0;
    }

    update(ball, currentTime)
    {
        // Verify if 1 second has passed
        if (currentTime - this.lastUpdate > this.viewInterval)
        {
            this.lastUpdate = currentTime;

            // Simulate future position
            this.targetY = this.simulateBallPosition(ball);
        }

        // Move AI to the predicted position with margin
        this.moveToTarget();
    }

    simulateBallPosition(ball)
    {
        // New instance of the ball
        let simulatedBall = new Ball(ball.radius, ball.color, ball.speed);
        simulatedBall.xpos = ball.xpos;
        simulatedBall.ypos = ball.ypos;
        simulatedBall.xdir = ball.xdir;
        simulatedBall.ydir = ball.ydir;

        let steps = this.predictionSteps;

        // Simulate the movement of the ball in the next steps
        while (steps > 0)
        {
            simulatedBall.move(true); 
            steps--;
        }

        // Return the Y position of the simulated ball
        return simulatedBall.ypos;
    }

    moveToTarget()
    {
        const margin = 10; // Margin for the shaking 10px

        // Move only if the difference between paddle and target is larger than the margin
        if (this.player.ypos < this.targetY - margin)
        {
            this.player.move_down = true;
            this.player.move_up = false;
        }
        else if (this.player.ypos > this.targetY + margin)
        {
            this.player.move_up = true;
            this.player.move_down = false;
        }
        else
        {
            this.player.move_up = false;
            this.player.move_down = false;
        }

        this.player.move();
    }
}
