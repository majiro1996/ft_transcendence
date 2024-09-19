document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://your-backend-domain/api/custom-token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            showAlert('Login successful!', 'success');
        } else if (data['2fa_required']) {
            showAlert('2FA required', 'warning');
        } else {
            showAlert('Invalid credentials', 'danger');
        }
    })
    .catch(error => console.error('Error:', error));
});

function getProtectedData() {
    const accessToken = localStorage.getItem('access_token');

    if (isTokenExpired(accessToken)) {
        refreshToken().then(() => {
            const newAccessToken = localStorage.getItem('access_token');
            fetchProtectedData(newAccessToken);
        });
    } else {
        fetchProtectedData(accessToken);
    }
}

function fetchProtectedData(token) {
    fetch('http://your-backend-domain/api/protected-endpoint/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error('Error:', error));
}

function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    return fetch('http://your-backend-domain/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: refreshToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            localStorage.setItem('access_token', data.access);
        } else {
            showAlert('Session expired. Please log in again.', 'danger');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    })
    .catch(error => console.error('Error:', error));
}

function isTokenExpired(token) {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    showAlert('Logged out successfully', 'success');
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.classList.remove('show');
        alert.classList.add('hide');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}