function AiPongGame(){
    const message = document.getElementById('message');
    
    let canvas = document.getElementById("game_display");
    let ctx = canvas.getContext("2d");
    
    let player1 = undefined;
    let player2 = undefined;
    let ball = undefined;
    
    // Player.js
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
    
    // Ball.js
    class Ball
    {
            constructor(radius, color, speed) {
                    this.radius = radius;
                    this.color = color;
                    this.speed = speed;
                    this.xpos = canvas.width / 2;
                    this.ypos = canvas.height / 2;
    
                    this.xdir = (Math.random() * (1 - (-1)) + (-1));
                    //this.ydir = (Math.random() * (1 - (-1)) + (-1));
                    this.ydir = 0;
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
				    player1.ypos = (canvas.height / 2) - player1.height / 2;
				    player2.ypos = (canvas.height / 2) - player2.height / 2;
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
				    player1.ypos = (canvas.height / 2) - player1.height / 2;
                                    player2.ypos = (canvas.height / 2) - player2.height / 2;
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
    
            move(simulation = false)
            {
                    this.#collisions(simulation);
                    //this.#collisions();
                    this.xpos += this.xdir * this.speed;
                    this.ypos += this.ydir * this.speed;
            }
    }
    
    // events.js
    function event_resize()
    {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    
            if (!(player1 == undefined || player2 == undefined || ball == undefined))
            {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    player1.xpos = 50;
                    player2.xpos = canvas.width - 50;
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
            if (e.key == "ArrowUp") player2.move_up = true;
            if (e.key == "ArrwDown") player2.move_down = true;
    }
    
    function event_keyup(e)
    {
            if (player1 == undefined || player2 == undefined) return ;
            if (e.key == "w") player1.move_up = false;
            if (e.key == "s") player1.move_down = false;
            if (e.key == "ArrowUp") player2.move_up = false;
            if (e.key == "ArrowDown") player2.move_down = false;
    }
    
    // time.js
    let time_last = new Date().getTime();
    let time_now = 0;
    let delta_time = 0;
    let counter = 0;
    
    function DeltaTime()
    {
            time_now = new Date().getTime();
            delta_time = time_now - time_last;
            time_last = new Date().getTime();
    }
    
    // AI.js
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
                this.targetY = this.simulateBallPosition(ball) - this.player.height / 2;
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
    
    function send_results(){
        window.location.hash = "#";
    }
    
    message.parentElement.onclick = send_results;
    
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
    }
    AiPongGame();
