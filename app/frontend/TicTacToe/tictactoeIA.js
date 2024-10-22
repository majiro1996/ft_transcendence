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
    }


//Message for the turn
function updateTurnMessage()
{
    currentTurn.textContent = `Turn: Player ${currentPlayer}`;
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
        message.textContent = `${currentPlayer} wins!`;
        winnerPlayer = currentPlayer;
        return;
    }
    //If is a Tie...
    if (boardState.every(cell => cell !== ''))
    {
        gameActive = false;
        message.textContent = `It's a tie!`;
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
        console.log("AI used Minimax to decide the move.");
    }
    else
    {
        // Make a random move
        bestMove = getRandomMove();
        console.log("AI made a random move.");
    }

    makeMove(bestMove, 'O');
    if (checkWin()) {
        gameActive = false;
        message.textContent = `O wins!`;
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
