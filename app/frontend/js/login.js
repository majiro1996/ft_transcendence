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

function login2fa() {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    fetch('http://localhost:8000/login-2fa/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    // if the response is successful redirect to the 2fa page
    .then(data => {
        console.log('valid credentials, proceed to 2fa');
        window.location.hash = '#auth2fa';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Invalid credentials, please try again');
    });
}

function verify2fa() {
    const data = { 
        username: document.getElementById('username').value,
        otp: document.getElementById('otp').value,
    };
    
    fetch('http://localhost:8000/2fa/verify/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.access_token || !data.refresh_token) {
            alert('Something went wrong');
            return;
        }
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        console.log('Login successful');
        window.location.hash = '#'  // redirect to home page
        RouterLb.updateHeaderAndFooter(currentLang);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Invalid OTP, please try again');
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Logout failed');
        }
    
        // Clear tokens from localStorage or sessionStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    
        // Redirect to login page or home
        window.location.hash = '#login';
        RouterLb.updateHeaderAndFooter(currentLang);
        console.log('Logout successful');
    })
	.catch(error => {
    	console.error('Error:', error);
        alert('logout failed');
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


function isLoggedIn() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return false;
    }
    try {
        return !isTokenExpired(token);
    }
    catch (error) {
        return false;
    }
}



// collect all the functions in an object
const AuthLb = {
    register,
    login,
    logout,
    getProtectedData,
    login2fa,
    verify2fa,
    refreshToken,
    isTokenExpired,
    isLoggedIn,
};

window.AuthLb = AuthLb;