function register() {
	const data = {
    	username: document.getElementById('username').value,
    	password: document.getElementById('password').value,
    	email: document.getElementById('email').value,
	};

	fetch('http://localhost:8000/register/', {
    	method: 'POST',
    	headers: {
        	'Content-Type': 'application/json',
    	},
    	body: JSON.stringify(data),
	})
	.then(response => response.json())
	.then(data => {
    	console.log('Registration successful', data);
	})
	.catch(error => {
    	console.error('Error:', error);
	});
}

function login() {
	const data = {
    	username: document.getElementById('username').value,
    	password: document.getElementById('password').value,
	};

	fetch('http://localhost:8000/login/', {
    	method: 'POST',
    	headers: {
        	'Content-Type': 'application/json',
    	},
    	body: JSON.stringify(data),
	})
	.then(response => response.json())
	.then(data => {
    	localStorage.setItem('access_token', data.access);
    	localStorage.setItem('refresh_token', data.refresh);
    	console.log('Login successful');
	})
	.catch(error => {
    	console.error('Error:', error);
	});
}

function logout() {
	const refresh_token = localStorage.getItem('refresh_token');
    
	// Send refresh token to backend to blacklist it
	fetch('http://localhost:8000/logout/', {
    	method: 'POST',
    	headers: {
        	'Content-Type': 'application/json',
        	'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // Include access token for authentication
    	},
    	body: JSON.stringify({ refresh_token: refresh_token }),
	})
	.then(response => response.json())
	.then(data => {
    	console.log('Logout successful', data);

    	// Clear tokens from localStorage or sessionStorage
    	localStorage.removeItem('access_token');
    	localStorage.removeItem('refresh_token');

    	// Optionally redirect to login page or home
    	window.location.href = '/login';
	})
	.catch(error => {
    	console.error('Error:', error);
	});
}

function isTokenExpired(token) {
    const decodedToken = jwt_decode(token);
    return decodedToken.exp < Date.now() / 1000;
}

function refreshToken() {
	const refresh_token = localStorage.getItem('refresh_token');

	fetch('http://localhost:8000/token-refresh/', {
    	method: 'POST',
    	headers: {
        	'Content-Type': 'application/json',
    	},
    	body: JSON.stringify({refresh: refresh_token}),
	})
	.then(response => response.json())
	.then(data => {
    	localStorage.setItem('access_token', data.access);
	})
	.catch(error => {
    	console.error('Error:', error);
	});
}




function getProtectedData() {
	const token = localStorage.getItem('access_token');
    
    if (isTokenExpired(token)) {
        refreshToken();
    }                               
        
	fetch('http://localhost:8000/protected-endpoint/', {
    	method: 'GET',
    	headers: {
        	'Authorization': `Bearer ${token}`,
    	}
	})
	.then(response => response.json())
	.then(data => {
    	console.log('Protected data:', data);
	})
	.catch(error => {
    	console.error('Error:', error);
	});
}



// make functions global
window.register = register;
window.login = login;
window.logout = logout;
window.getProtectedData = getProtectedData;
