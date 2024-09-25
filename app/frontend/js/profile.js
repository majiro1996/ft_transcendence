document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/profile')
        .then(response => response.json())
        .then(data => {
            document.getElementById('username').textContent = data.username;

            const friendsList = document.getElementById('friends');
            data.friends.forEach(friend => {
                const li = document.createElement('li');
                li.className = 'friend';
                li.innerHTML = `
                    <span>${friend.name}</span>
                    <span class="${friend.isOnline ? 'online' : 'offline'}">
                        ${friend.isOnline ? 'Online' : 'Offline'}
                    </span>
                `;
                friendsList.appendChild(li);
            });

            const scoresList = document.getElementById('scores');
            data.scores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `Game: ${score.game}, Score: ${score.score}`;
                scoresList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching profile data:', error));
});