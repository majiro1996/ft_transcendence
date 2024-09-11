const board = document.getElementById('board');
const message = document.getElementById('message');
const currentTurn = document.getElementById('current-turn');

//States of the game
let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let winnerPlayer;

//victory combinations. Each number is a position of the table
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

//Message for the turn
function updateTurnMessage()
{
    currentTurn.textContent = `Turn: Player ${currentPlayer}`;
}


board.addEventListener('click', (event) => {
    const clickedCell = event.target; //cell where user clicks
    const clickedCellIndex = clickedCell.getAttribute('data-index');//index of that cell

     //check if cell is available
    if (clickedCell.textContent !== '' || !gameActive)
        return;

    boardState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
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
     //Change to polayer X or player O
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnMessage();
});

//Check if wins
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

updateTurnMessage();
