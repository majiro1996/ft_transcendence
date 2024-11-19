let isTournament = false

function showItem(item) {
    document.getElementById(item).style.display = 'block';
}

function hideItem(item) {
    document.getElementById(item).style
        .display = 'none';
}

function changeLocation(location) {
    window.location.hash = location;
}

// Function to handle GET request and populate the form
async function getProfileSettings() {
    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('2fa_enabled').checked = data['2fa_enabled'];
        document.getElementById('language_preference').value = data.language_preference;
    } catch (error) {
        showAlert("something-went-wrong");
    }
}

async function LoadProfile() {
    try {
        const response = await fetch(apiurl + '/users/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json();
        document.getElementById('pr_username').textContent = data.user.user;
        if (data.user.profile_pic != null)
            document.getElementById('pr_user_image').src = "data:image/png;base64," + data.user.profile_pic;
        else
            document.getElementById('pr_user_image').src = '/media/Profile_avatar_placeholder_large.png';
        if (data.user.requests.length != 0)
            document.getElementById('pr_friend_count_number').textContent = data.user.friends.length + ' (' + data.user.requests.length + ')';
        else
            document.getElementById('pr_friend_count_number').textContent = data.user.friends.length;
        data.user.requests.forEach(request => {
            var template = document.getElementById('request_template').cloneNode(true);
            if (request.profile_pic != null)
                template.querySelector('img').src = "data:image/png;base64," + request.profile_pic;
            template.querySelector('#friend_username_template').textContent = request.user;
            if (request.online)
                template.querySelector('#friend_status_template').textContent = 'Online';
            else {
                template.querySelector('#friend_status_template').textContent = 'Offline';
                template.querySelector('#friend_status_template').classList.add('pr_friend_status_off');
                template.querySelector('#friend_status_template').classList.remove('pr_friend_status_on');
            }
            template.querySelector('#accept-template').id = 'accept-' + request.user;
            template.querySelector('#decline-template').id = 'decline-' + request.user;
            template.style.display = 'flex';
            template.id = request.user;
            document.getElementById('pr_friendbox').appendChild(template);
        });
        data.user.friends.forEach(friend => {
            var template = document.getElementById('friend_template').cloneNode(true);
            if (friend.profile_pic != null)
                template.querySelector('img').src = "data:image/png;base64," + friend.profile_pic;
            template.querySelector('#friend_username_template').textContent = friend.user;
            if (friend.online)
                template.querySelector('#friend_status_template').textContent = 'Online';
            else {
                template.querySelector('#friend_status_template').textContent = 'Offline';
                template.querySelector('#friend_status_template').classList.add('pr_friend_status_off');
                template.querySelector('#friend_status_template').classList.remove('pr_friend_status_on');
            }
            template.style.display = 'flex';
            template.id = friend.user;
            document.getElementById('pr_friendbox').appendChild(template);
        });
        data.user.history.forEach(game => {
            if (game.winner == data.user.user) {
                template = document.getElementById('pr_history_template_won').cloneNode(true);
                template.querySelector('#pr_history_title_template').textContent = game.game;
                template.querySelector('#pr_history_winner_template').textContent = data.user.user;
                if (game.user1 == data.user.user)
                    template.querySelector('#pr_history_opponent_template').textContent = game.user2;
                else
                    template.querySelector('#pr_history_opponent_template').textContent = game.user1;
            }
            else {
                template = document.getElementById('pr_history_template_lost').cloneNode(true);
                template.querySelector('#pr_history_title_template').textContent = game.game;
                if (game.user1 == data.user.user)
                    template.querySelector('#pr_history_opponent_template').textContent = game.user2;
                else
                    template.querySelector('#pr_history_opponent_template').textContent = game.user1;
                template.querySelector('#pr_history_loser_template').textContent = data.user.user;
            }
            template.id = game.id;
            document.getElementById('pr_history').appendChild(template);
            if (document.getElementById('pr_history').style.display == 'none')
                document.getElementById('pr_history').style = '';
        });
        document.getElementById('pr_history_template_won').remove();
        document.getElementById('pr_history_template_lost').remove();
        document.getElementById('pong_wins').textContent = data.user.game_stats["pong"].wins;
        document.getElementById('pong_losses').textContent = data.user.game_stats["pong"].losses;
        document.getElementById('pong_wr_text').textContent = data.user.game_stats["pong"].win_rate + '%';
        document.getElementById('ttt_wins').textContent = data.user.game_stats["tic-tac-toe"].wins;
        document.getElementById('ttt_losses').textContent = data.user.game_stats["tic-tac-toe"].losses;
        document.getElementById('ttt_ties').textContent = data.user.game_stats["tic-tac-toe"].ties;
        document.getElementById('ttt_wr_text').textContent = data.user.game_stats["tic-tac-toe"].win_rate + '%';
        document.getElementById('pong_wr_bar').style.width = data.user.game_stats["pong"].bar_size + "px";
        document.getElementById('ttt_wr_bar').style.width = data.user.game_stats["tic-tac-toe"].bar_size + "px";
    }

    catch (error) {
        showAlert("something-went-wrong");;
    }
}

async function acceptFriendRequest(friend, action) {
    try {
        const response = await fetch(apiurl + '/friend-request-accept/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                'user_sender': friend.parentNode.id,
                'action': action
            })
        });
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
    if (action == 'accept') {
        var new_friend = document.getElementById(friend.parentNode.id).cloneNode(true);
        new_friend.classList.remove('pr_friend_request_item');
        new_friend.classList.add('pr_friend_item');
        new_friend.querySelector('#accept-' + friend.parentNode.id).remove();
        new_friend.querySelector('#decline-' + friend.parentNode.id).remove();
        document.getElementById('pr_friendbox').appendChild(new_friend);
        friend.parentNode.remove();
    }
    else
        friend.parentNode.remove();
    var requests = document.getElementById('pr_friend_count_number').textContent.split('(')[1].split(')')[0];
    var friend_nbr = document.getElementById('pr_friend_count_number').textContent.split('(')[0];
    if (requests > 1 && action == 'accept')
        document.getElementById('pr_friend_count_number').textContent = (parseInt(friend_nbr) + 1).toString() + ' (' + (requests - 1) + ')';
    else if (requests == 1 && action == 'accept')
        document.getElementById('pr_friend_count_number').textContent = (parseInt(friend_nbr) + 1).toString();
    else if (requests > 1 && action == 'decline')
        document.getElementById('pr_friend_count_number').textContent = friend_nbr + ' (' + (requests - 1) + ')';
    else
        document.getElementById('pr_friend_count_number').textContent = friend_nbr;

}

async function LoadFriends() {
    try {
        const response = await fetch(apiurl + '/users/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        const data = await response.json();
        data.user.friends.forEach(friend => {
            var template = document.getElementById('friend_template').cloneNode(true);
            if (friend.profile_pic != null)
                template.querySelector('img').src = "data:image/png;base64," + friend.profile_pic;
            else
                template.querySelector('img').src = '/media/Profile_avatar_placeholder_large.png';
            template.querySelector('#template_username').textContent = friend.user;
            if (friend.online)
                template.querySelector('#template_status').textContent = 'Online';
            else {
                template.querySelector('#template_status').textContent = 'Offline';
                template.querySelector('#template_status').classList.add('pr_friend_status_off');
                template.querySelector('#template_status').classList.remove('pr_friend_status_on');
            }
            template.style.display = 'flex';
            template.id = friend.user;
            template.hidden = false;
            document.getElementById('pr_friendbox_editor').appendChild(template);
        });
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
}

async function DeleteFriend(friend) {
    try {
        const response = await fetch(apiurl + '/friend-request/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                'user': friend
            })
        });
        document.getElementById(friend).remove();
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
}

async function SendFriendRequest() {
    const friend = document.getElementById('friend_name').value;
    try {
        const response = await fetch(apiurl + '/friend-request/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                'user_receiver': friend
            })
        });
        const data = await response.json();
        if (data.success) 
            showAlert(data.success);
        else 
            showAlert(data.error);
    }
    catch (error) {
        showAlert("something-went-wrong");
    }
}

async function submitProfilePic() {
    const profile_pic = document.getElementById('profile_picture').files[0];
    const formData = new FormData();
    formData.append('profile-picture', profile_pic);
    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showAlert(data.success);
        }
        else {
            showAlert(data.error);
        }
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
}

// Function to handle POST request when form is submitted
async function submitProfileSettings(settingType, value) {
    const payload = {};
    debugger;
    payload[settingType] = value;

    if (settingType === 'password') {
        if (value[0] != value[1]) {
            showAlert('password-not-match');
            return;
        }
        payload[settingType] = value[0];
    }

    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            // show success alert
            showAlert(data.success);
            // reset the jwt tokens if provided
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
        } else {
            showAlert(data.error);
        }

        if (settingType === 'language_preference') {
            currentLang = value;
            RouterLb.setLanguage(value);
        }
    } catch (error) {
        showAlert("something-went-wrong");;
    }
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


function showDifficultySelection() {
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('difficulty-screen').style.display = 'flex';
}

function startGameWithDifficulty(difficulty) {
    localStorage.setItem('tictactoeDifficulty', difficulty);

    document.getElementById('difficulty-screen').style.display = 'none';
    showGameBoard();

    const script = document.createElement('script');
    script.src = '../TicTacToe/tictactoeIA.js';
    document.body.appendChild(script);
}

function showGameBoard() {
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';
}

function loadGame(scriptName) {
    const script = document.createElement('script');
    script.src = scriptName;
    document.body.appendChild(script);
}

// pong game

function LoadPong() {
    document.getElementById('two-players').addEventListener('click', () => {
        pong_startTwoPlayerGame();
    });

    document.getElementById('one-player').addEventListener('click', () => {
        pong_showDifficultySelection();
    });
}

function pong_showDifficultySelection() {
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('difficulty-screen').style.display = 'flex';  // Show the difficulty selection screen
}

function pong_startTwoPlayerGame() {
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';  // Show the game area for 2 players

    // Load the game script for two players (pong.js)
    const script = document.createElement('script');
    script.src = '../pong/pong.js';  // Make sure pong.js is in the same directory
    document.body.appendChild(script);
}

function pong_startGameWithDifficulty(difficulty) {
    // Save the difficulty in localStorage
    localStorage.setItem('pongDifficulty', difficulty);

    // Hide the difficulty screen and show the game board
    document.getElementById('difficulty-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';

    // Load the game for single player with AI (pongAI.js)
    const script = document.createElement('script');
    script.src = '../pong/pongAI.js';
    document.body.appendChild(script);
}

// ----------------------

//TOURNAMENTS

async function LoadTournamentsHome() {
    try {
        const response = await fetch(apiurl + '/tournaments/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        const result = await response.json();
        if (!response.ok) {
            showAlert(result.error);
            return;
        }
        result.user.invites.forEach(invite => {
            var template = document.getElementById('tour_invite_template').cloneNode(true);
            template.querySelector('#tour_hostname_template').textContent = invite.host;
            template.querySelector('#tour_name_template').textContent = invite.tournament_name;
            template.querySelector('#tour_accept_template').id = 'accept-' + invite.tournament_name;
            template.querySelector('#tour_decline_template').id = 'decline-' + invite.tournament_name;
            template.style.display = 'flex';
            template.id = invite.tournament_name;
            document.getElementById('tour_home_subscoll').appendChild(template);
        });
        result.user.tournaments.forEach(tournament => {
            var template = document.getElementById('tour_accepted_template').cloneNode(true);
            template.querySelector('#tour_hostname_template').textContent = tournament.host;
            template.querySelector('#tour_name_template').textContent = tournament.tournament_name;
            template.style.display = 'flex';
            template.id = tournament.tournament_name;
        });

    }

    catch (error) {
        showAlert("something-went-wrong");;
    }
}

async function acceptTourInvite(tournament, action) {
    try {
        const response = await fetch(apiurl + '/tournament-invite-accept/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                'action': action
            })
        });
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }

}

async function createTournament(game_type) {
    const tournament_name = document.getElementById('tournament_name').value;
    const guest0 = document.getElementById('guest0').value;
    const guest1 = document.getElementById('guest1').value;
    const guest2 = document.getElementById('guest2').value;
    const guest3 = document.getElementById('guest3').value;
    const guest4 = document.getElementById('guest4').value;
    const guest5 = document.getElementById('guest5').value;
    const guest6 = document.getElementById('guest6').value;

    try {
        const response = await fetch(apiurl + '/create-tournament/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                tournament_name: tournament_name,
                game_type: game_type,
                user_guests: [guest0, guest1, guest2, guest3, guest4, guest5, guest6]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error);
        }

        if (data.success) {
            // redirect to tournament starting page // wip
            showAlert(data.success);
        }

    } catch (error) {
        showAlert("something-went-wrong");;
    }
}

async function getTournament() {
    try {
        const response = await fetch(apiurl + '/get-tournament/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        if (!response.ok) {
            //show error alert // wip
        }

        const data = await response.json();
        //if there is no tournament 
    }

    catch (error) {
        //if no tournament available  redirect to create tournament page // wip
        window.location.href = '#/createTournament';
    }

}

async function LoadScores() {
    try {
        const response = await fetch(apiurl + '/leaderboard/', {
            method: 'GET',
        });
        const data = await response.json();
        console.log(data);
        data.leaderboard.forEach(user => {
            var template = document.getElementById('template_score').cloneNode(true);
            template.querySelector('#template_rank').textContent = user.rank;
            template.querySelector('#template_name').textContent = user.user;
            template.querySelector('#template_wins').textContent = user.wins;
            template.style = '';
            template.id = user.user;
            document.getElementById('scoreboard').appendChild(template);
        });
        document.getElementById('template_score').remove();
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
}

const CommonLb = {
    getProfileSettings,
    submitProfileSettings
};

window.CommonLb = CommonLb;

// Bootstrap alerts
function showAlert(id) {
    hideAllAlerts();
    let alert = document.getElementById(id);
    if (!alert)
        return;
    alert.style.display = 'block';
    setTimeout(() => hideAlert(alert), 5000); // 5 seconds
}
function hideAlert(node) {
    node.style.display = 'none';
}

function hideAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.style.display = 'none';
    });
}