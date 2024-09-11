
class AIPlayer
{
    constructor(player, predictionSteps, predictionInterval)
    {
        this.player = player;
        this.predictionSteps = predictionSteps;  // Number of staps forward
        this.predictionInterval = predictionInterval; // ms between predictions  (cada cuantos ms se actualiza la prediccion)
        this.targetY = player.ypos;  // Pos Y objective
        this.viewInterval = 1000;  //1 second
        this.lastUpdate = 0;
    }

    update(ball, currentTime)
    {
        // Verify if 1 second has passed
        if (currentTime - this.lastUpdate > this.viewInterval)
        {
            this.lastUpdate = currentTime;

            // Simulate future pos
            this.targetY = this.simulateBallPosition(ball);
        }

        // Move ia to the predicted pos
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

        // Simulate the movement ob the ball in next steps
        while (steps > 0)
        {
            simulatedBall.move(true); 
            steps--;
        }

        // Return to Y simulated pos
        return simulatedBall.ypos;
    }
    moveToTarget() {
        // Movement to the objetive
        if (this.player.ypos < this.targetY)
        {
            this.player.move_down = true;
            this.player.move_up = false;
        } else if (this.player.ypos > this.targetY)
        {
            this.player.move_up = true;
            this.player.move_down = false;
        } else
        {
            // Not move
            this.player.move_up = false;
            this.player.move_down = false;
        }

        this.player.move();
    }
}