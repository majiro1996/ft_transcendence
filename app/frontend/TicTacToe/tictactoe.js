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

function getCookie(cname)
{
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++)
        {
                let c = ca[i];
                while (c.charAt(0) == ' ')
                        c = c.substring(1);
                if (c.indexOf(name) == 0)
                        return c.substring(name.length, c.length);
        }
        return "";
}

async function send_results()
        {
                        if (!isTournament)
                        {
                                        changeLocation("#");
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
				{
					changeLocation("#tournament");
					return;
				}
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
                        changeLocation("#tournaments");
        }

message.onclick = send_results

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
    if (winnerPlayer)
        return;
    //If is a Tie...
    if (boardState.every(cell => cell !== ''))
    {
        gameActive = false;
        message.textContent = `It's a tie!`;
        winnerPlayer = "tie"
        return;
    }
     //Change to polayer X or player O
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnMessage();
});

//Check if wins
function checkWin()
{
    if (winnerPlayer === "tie")
        return false;
    else if (winnerPlayer === "X" || winnerPlayer === "O")
        return true;
    for (let i = 0; i < winningConditions.length; i++)
    {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] !== '' && boardState[a] === boardState[b] && boardState[a] === boardState[c])
            return true;
    }
    return false;
}

updateTurnMessage();
})();
