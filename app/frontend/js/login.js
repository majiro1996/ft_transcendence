const backendUrl = 'http://localhost';
const backendPort = '8000';

let apiurl = `${backendUrl}:${backendPort}`;

window.apiurl = apiurl;


async function register() {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
    };

    try {
        const response = await fetch(apiurl + '/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Registration successful');
            console.log('Access Token:', result.access_token);
            console.log('Refresh Token:', result.refresh_token);
            window.location.hash = '#';  // redirect to home page
            RouterLb.setPreferredLanguage();
        }
    } catch (error) {
        alert('Error: ' + error);
        console.error('Error:', error);
    }
}

// function login() {
// 	const data = {
//     	username: document.getElementById('username').value,
//     	password: document.getElementById('password').value,
// 	};

// 	fetch('http://localhost:8000/login/', {
//     	method: 'POST',
//     	headers: {
//         	'Content-Type': 'application/json',
//     	},
//     	body: JSON.stringify(data),
// 	})
// 	.then(response => response.json())
// 	.then(data => {
//     	localStorage.setItem('access_token', data.access);
//     	localStorage.setItem('refresh_token', data.refresh);
//     	console.log('Login successful');
// 	})
// 	.catch(error => {
//     	console.error('Error:', error);
// 	});
// }

async function login2fa() {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    try {
        const response = await fetch(`${backendUrl}:${backendPort}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success === '2fa required') {
            console.log('valid credentials, proceed to 2fa');
            window.location.hash = '#auth2fa';
        } else if (result.access_token && result.refresh_token) {
            console.log('Login successful');
            // Handle successful login without 2FA
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            window.location.hash = '#'  // redirect to home page
            RouterLb.updateHeaderAndFooter(currentLang);
            RouterLb.setPreferredLanguage();
        } else if (result.error) {
            alert('Invalid credentials, please try again');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred, please try again');
    }
}

async function verify2fa() {
    const data = { 
        username: document.getElementById('username').value,
        otp: document.getElementById('otp').value,
    };

    try {
        const response = await fetch(`${backendUrl}:${backendPort}/login-2fa/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || 'Something went wrong');
            return;
        }

        if (!result.access_token || !result.refresh_token) {
            alert('Something went wrong');
            return;
        }

        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        console.log('Login successful');
        window.location.hash = '#';  // redirect to home page
        RouterLb.updateHeaderAndFooter(currentLang);
        RouterLb.setPreferredLanguage();
    } catch (error) {
        console.error('Error:', error);
        alert('Invalid OTP, please try again');
    }
}

async function logout() {
    const refresh_token = localStorage.getItem('refresh_token');

    try {
        const response = await fetch(`${backendUrl}:${backendPort}/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // Include access token for authentication
            },
            body: JSON.stringify({ refresh_token: refresh_token }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Clear tokens from localStorage or sessionStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Redirect to login page or home
        window.location.hash = '#login';
        RouterLb.updateHeaderAndFooter(currentLang);
        console.log('Logout successful');
    } catch (error) {
        console.error('Error:', error);
        alert('Logout failed: ' + error.message);
    }
}

function isTokenExpired(token) {
    const decodedToken = jwt_decode(token);
    return decodedToken.exp < Date.now() / 1000;
}

async function refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');

    try {
        const response = await fetch(apiurl + '/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refresh_token }),
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        // Update the access token in localStorage
        localStorage.setItem('access_token', result.token);
        console.log('Token refreshed successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Token refresh failed: ' + error.message);
    }
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


async function isLoggedIn() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return false;
        }

        const response = await fetch(apiurl + '/protected/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('Response:', response);
        
        if (response.ok) {
            console.log('test ok');
            return true;
        }
        else {
            console.log('test not ok');
            return false;
        }
        
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}


// collect all the functions in an object
const AuthLb = {
    register,
    //login,
    logout,
    getProtectedData,
    login2fa,
    verify2fa,
    refreshToken,
    isTokenExpired,
    isLoggedIn,
};

window.AuthLb = AuthLb;