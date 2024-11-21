let isTournament = false;
let tUser1 = null;
let tUser2 = null;
let tName = null;

function setupTournament(u1, u2, name)
{
	tUser1 = u1;
	tUser2 = u2;
    tName = name;
	isTournament = true;
}

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
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }

        const data = await response.json();
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('2fa_enabled').checked = data['2fa_enabled'];
        document.getElementById('language_preference').value = data.language_preference;
    } catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
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
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
    if (isTournament && tUser1 != null && tUser2 != null) {
        pong_startTwoPlayerGame();
    }
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
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
        //if the host has an open tournament redirect to the tournament options page
        if (result.success) {
            if (result.success == 'ongoing-tournament') {
            changeLocation("#tournament");
            return;
            }
            if (result.success == 'ready-tournament') {
                changeLocation("#tournamentOptions");
                return;
            }
        }

        result.user.invites.forEach(invite => {
            var template = document.getElementById('tour_invite_template').cloneNode(true);
            template.querySelector('#tour_hostname_template').textContent = invite.host;
            template.querySelector('#tour_name_template').textContent = invite.tournament_name;
            template.querySelector('#tour_accept_template').id = 'accept-' + invite.tournament_name;
            template.querySelector('#tour_decline_template').id = 'decline-' + invite.tournament_name;
            if (invite.profile_pic != null)
                template.querySelector('#img_template').src = "data:image/png;base64," + invite.profile_pic;
            else
                template.querySelector('#img_template').src = '/media/Profile_avatar_placeholder_large.png';
            template.style.display = 'flex';
            template.id = invite.tournament_name;
            document.getElementById('tournaments_bar').appendChild(template);
        });
        result.user.tournaments.forEach(tournament => {
            var template = document.getElementById('tour_accepted_template').cloneNode(true);
            template.querySelector('#tour_hostname_template').textContent = tournament.host;
            template.querySelector('#tour_name_template').textContent = tournament.tournament_name;
            if (tournament.profile_pic != null)
                template.querySelector('#img_template').src = "data:image/png;base64," + tournament.profile_pic;
            else
                template.querySelector('#img_template').src = '/media/Profile_avatar_placeholder_large.png';
            template.style.display = 'flex';
            template.id = tournament.tournament_name;
            document.getElementById('tournaments_bar').appendChild(template);
        });

    }

    catch (error) {
        if (response.status === 401)
            window.location.hash = '#login';
        else
            showAlert("something-went-wrong");
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
                'action': action,
                'tournament_name': tournament.parentNode.id
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
        if (action == 'accept') {
            var new_tour = document.getElementById(tournament.parentNode.id).cloneNode(true);
            new_tour.classList.remove('tour_invite_item');
            new_tour.classList.add('tour_accepted_item');
            new_tour.querySelector('#accept-' + tournament.parentNode.id).remove();
            new_tour.querySelector('#decline-' + tournament.parentNode.id).remove();
            document.getElementById('tournaments_bar').appendChild(new_tour);
            document.getElementById(tournament.parentNode.id).remove();
        }
        else
            document.getElementById(tournament.parentNode.id).remove();
    }
    catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert(data.error);
            return;
        }

        if (data.success) {
            // redirect to tournament starting page // wip
            showAlert(data.success);
            changeLocation("#tournamentOptions");
        }

    } catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
    }
}

async function CreateTournamentCheck() {
    try {
        const response = await fetch(apiurl + '/protected/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
    }
    catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else {
            showAlert("something-went-wrong");
        }
    }
}

async function StartMatch() {
    try {
        const response = await fetch(apiurl + '/start-match/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                tournament_name: document.getElementById('tournament_name').textContent
            })
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
        setupTournament(data.user1, data.user2, document.getElementById('tournament_name').textContent);
        changeLocation("#pong");
    }
    catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else {
            showAlert("something-went-wrong");
        }
    }
}



async function LoadTournamentOptions() {
    try {
        const response = await fetch(apiurl + '/tournament-options/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }

        // Populate the tournament options
        document.getElementById('tournament_name').textContent = data.tournament_name;
        document.getElementById('game_type').textContent = data.game_type;

        const playerContainer = document.getElementById('player_container');
        playerContainer.innerHTML = ''; // Clear existing players

        data.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'lobby_player_card';
            playerCard.innerHTML = `
                <img class="lobby_player_image" src="${'../media/Profile_avatar_placeholder_large.png'}">
                <p class="lobby_player_username">${player.username}</p>
                <p class="lobby_player_status_${player.status}">${player.status === 'confirmed' ? '✓' : '✕'}</p>
            `;
            if (player.profile_pic != null)
                playerCard.querySelector('img').src = "data:image/png;base64," + player.profile_pic;
            playerContainer.appendChild(playerCard);
        });

        if (data.players.every(player => player.status === 'confirmed')) {
            document.getElementById('start_tournament').style.display = 'block';
            document.getElementById('refresh_players').style.display = 'none';
        } else {
            document.getElementById('start_tournament').style.display = 'none';
            document.getElementById('refresh_players').style.display = 'block';
        }

    } catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
    }
}

async function DeleteTournament() {
    try {
        const response = await fetch(apiurl + '/delete-tournament/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                tournament_name: document.getElementById('tournament_name').textContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }
        if (data.success) {
            changeLocation("#tournaments");
            showAlert(data.success);
        }
    }
    catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
    }
}

async function LoadTournament() {
    debugger
    try {
        const response = await fetch(apiurl + '/start-tournament/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }

        if (data.success) {
            document.getElementById('tournament_name').textContent = data.tournament_name;
            const players = data.players;
            for (let i = 0; i < players.length; i++) {
                const qualPosition = document.getElementById(`bracket_qual${i + 1}`);
                if (qualPosition) {
                    qualPosition.querySelector('p').textContent = players[i];
                }
            }

            const semiFinals = data.semifinals;
            if (semiFinals.length === 4 && semiFinals.every(player => player === null)) {
                return
            }

            if (semiFinals[0] != null) {
                document.getElementById('bracket_semi1').querySelector('p').textContent = semiFinals[0];
            }
            if (semiFinals[1] != null) {
                document.getElementById('bracket_semi2').querySelector('p').textContent = semiFinals[1];
            }
            if (semiFinals[2] != null) {
                document.getElementById('bracket_semi3').querySelector('p').textContent = semiFinals[2];
            }
            if (semiFinals[3] != null) {
                document.getElementById('bracket_semi4').querySelector('p').textContent = semiFinals[3];
            }

            const final = data.final;
            if (final[0] != null) {
                document.getElementById('bracket_winner').querySelector('p').textContent = final[0] + ' vs ???';
            }
            if (final[1] != null) {
                document.getElementById('bracket_winner').querySelector('p').textContent = final[0] + ' vs ' + final[1];
            }

        }
    } catch (error) {
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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
        if (response.status === 401) {
            window.location.hash = '#login';
        }
        else
            showAlert("something-went-wrong");
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

async function tournamentEnd(winner, tournament_n) {
    try {
        const response = await fetch(apiurl + '/end-tournament/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                tournament_name: tournament_n,
                winner: winner
            })
        });

        const data = await response.json();
        if (!response.ok)
        {
            showAlert(data.error);
            return;
        }
        if (data.success) {
            showAlert(data.success);
            changeLocation("#tournaments");
        }
    }
    catch (error) {
        showAlert("something-went-wrong");
    }

}


// TEST FUNCTIONS


async function TestCreateUsers() {
    try {
        const response = await fetch(apiurl + '/test-users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.hash = '#login';
            }
            else
                showAlert("something-went-wrong");
            return;
        }

        const data = await response.json();
        console.log(data); 
    }
    catch (error) {
        console.error('Error:', error);
    }

}
