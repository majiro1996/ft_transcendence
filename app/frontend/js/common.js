
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


const CommonLb = {
    getProfileSettings,
    submitProfileSettings
};

window.CommonLb = CommonLb;