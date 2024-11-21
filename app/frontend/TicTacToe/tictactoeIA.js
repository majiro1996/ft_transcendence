(function() {
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const currentTurn = document.getElementById('current-turn');

    // States of the game
    let currentPlayer = 'X';
    let gameActive = true;
    let boardState = ['', '', '', '', '', '', '', '', ''];
    let winnerPlayer;

    // Victory combinations. Each number is a position of the table
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

	async function send_results()
        {
                        if (!isTournament)
                        {
                                        window.location.hash = "#";
                                        return;
                        }
                        try
                        {
                                        let p_winner = null;
                                        if (winnerPlayer === 'X')
                                                         p_winner = tUser1;
                                        else if (winnerPlayer === 'O')
                                                         p_winner = tUser2;
                                        else
                                                         p_winner = "tie";
                                        const response = await fetch(apiurl + "/game-stats/", {
                                                        method: "POST",
                                                        headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                                                        },
                                                        body: JSON.stringify({
                                                                        user1: tUser1,
                                                                        user2: tUser2,
                                                                        winner: p_winner,
                                                                        game_type: "tic-tac-toe",
                                                                        user1_score: 0,
                                                                        user2_score: 0,
                                                                        tournament_name: tName,
                                                        }),
                                        });
                                        localStorage.removeItem("user1");
                                        localStorage.removeItem("user2");
                                        isTournament = false;
                                        tUser1 = null;
                                        tUser2 = null;
                                        tName = null;
                        } catch (error){
                                        console.log(`Error: ${error}`);
                        }
                        window.location.hash = "#tournaments";
        }
	message.parentElement.onclick = send_results;

    // Difficulty
    const difficulty = localStorage.getItem('tictactoeDifficulty') || 'normal';
    let valor = 0.5;

    // Adjust difficulty
    switch (difficulty) {
        case 'easy':
            valor = 0.25;
            speed = 5;
            break;
        case 'normal':
            valor = 0.5;
            break;
        case 'hard':
            valor = 0.75;
            break;
        case 'extreme':
            valor = 1;
            break;
    }


//Message for the turn
function updateTurnMessage()
{
    currentTurn.textContent = `${currentPlayer}`;
}


board.addEventListener('click', (event) => {
    const clickedCell = event.target; //cell where user clicks
    const clickedCellIndex = clickedCell.getAttribute('data-index'); //index of that cell

    //check if cell is available
    if (clickedCell.textContent !== '' || !gameActive || currentPlayer !== 'X')
        return;

    makeMove(clickedCellIndex, currentPlayer);
    //Chacks if current player has win
    if (checkWin())
    {
        gameActive = false;
        message.textContent = `${currentPlayer}`;
        winnerPlayer = currentPlayer;
        message.parentNode.styles.display = "block";
        return;
    }
    //If is a Tie...
    if (boardState.every(cell => cell !== ''))
    {
        gameActive = false;
        message.textContent = `It's a tie!`;
        message.parentNode.styles.display = "block";
        return;
    }
    //Change to player. Time between turn
    currentPlayer = 'O';
    updateTurnMessage();
    setTimeout(aiMove, 500);
});

//Update board. (with the current player)
function makeMove(index, player)
{
    boardState[index] = player;
    const cell = board.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
}

function checkWin()
{
    for (let i = 0; i < winningConditions.length; i++)
    {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] !== '' && boardState[a] === boardState[b] && boardState[a] === boardState[c])
            return true;
    }
    return false;
}

// Move for the AI
function aiMove() {
    let bestMove;

    // Decide randomly whether to use Minimax or make a random move
    if (Math.random() < valor)
    {
        // Use Minimax to find the best move
        bestMove = getBestMove();
    }
    else
    {
        // Make a random move
        bestMove = getRandomMove();
    }

    makeMove(bestMove, 'O');
    if (checkWin()) {
        gameActive = false;
        message.textContent = `O!`;
        return;
    }

    if (boardState.every(cell => cell !== ''))
    {
        gameActive = false;
        message.textContent = `It's a tie!`;
        return;
    }

    currentPlayer = 'X';
    updateTurnMessage();
}

// Function to find a random empty spot for the AI
function getRandomMove() {
    const availableMoves = [];
    for (let i = 0; i < boardState.length; i++)
    {
        if (boardState[i] === '')
            availableMoves.push(i);
    }
    // Pick a random index from the available moves
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}


//This function uses MINIMAX algorithm to find the best movement for the IA
function getBestMove()
{
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < boardState.length; i++)
    {
        if (boardState[i] === '')
        {
            boardState[i] = 'O';
            let score = minimax(boardState, 0, false);
            boardState[i] = '';
            if (score > bestScore)
            {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}
//MINIMAX algorithm
function minimax(boardState, depth, isMaximizing)
{
    if (checkWin())
        return isMaximizing ? -10 : 10;
    if (boardState.every(cell => cell !== ''))
        return 0;

    if (isMaximizing)
    {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++)
        {
            if (boardState[i] === '')
            {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++)
        {
            if (boardState[i] === '')
            {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

updateTurnMessage();

})();
