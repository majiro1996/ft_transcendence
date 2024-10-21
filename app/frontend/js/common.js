
// Function to handle GET request and populate the form
function getProfileSettings() {
    fetch(apiurl + '/profile-settings/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('2fa_enabled').checked = data['2fa_enabled'];
    })
    .catch(error => console.error('Error:', error));
}

// Function to handle POST request when form is submitted
function submitProfileSettings() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const is2faEnabled = document.getElementById('2fa_enabled').checked;

    fetch(apiurl + '/profile-settings/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({
            username: username,
            email: email,
            '2fa_enabled': is2faEnabled
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('message').innerText = data.success;
        } else {
            document.getElementById('message').innerText = data.error;
        }
    })
    .catch(error => console.error('Error:', error));
}


//tic-tac-toe game 

function LoadTicTacToe() {
    document.getElementById('two-players').addEventListener('click', () => {
        showGameBoard();
        loadGame('../TicTacToe/tictactoe.js');
        });

    document.getElementById('one-player').addEventListener('click', () => {
        showDifficultySelection();
    });
}


function showDifficultySelection()
{
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('difficulty-screen').style.display = 'flex';
}

function startGameWithDifficulty(difficulty)
{
    localStorage.setItem('tictactoeDifficulty', difficulty);

    document.getElementById('difficulty-screen').style.display = 'none';
    showGameBoard();

    const script = document.createElement('script');
    script.src = '../TicTacToe/tictactoeIA.js';
    document.body.appendChild(script);
}

function showGameBoard()
{
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';
}

function loadGame(scriptName)
{
    const script = document.createElement('script');
    script.src = scriptName;
    document.body.appendChild(script);
}

// ----------------------

const CommonLb = {
    getProfileSettings,
    submitProfileSettings
};

window.CommonLb = CommonLb;