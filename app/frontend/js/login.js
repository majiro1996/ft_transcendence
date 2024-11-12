
const backendUrl = BACKEND_API_URL;
const backendPort = BACKEND_PORT;

//let apiurl = `${backendUrl}:${backendPort}`;
let apiurl = "http://" + backendUrl + ":" + backendPort;

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
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            window.location.hash = '#';  // redirect to home page
            RouterLb.setPreferredLanguage();
        }
    } catch (error) {
        alert('Error: ' + error);
        console.error('Error:', error);
    }
}

async function login2fa() {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    try {
        const response = await fetch(apiurl + '/login/', {
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
        const response = await fetch(apiurl + '/login-2fa/', {
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
        const response = await fetch(apiurl + '/logout/', {
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

// Function to handle account deletion
async function deleteAccount() {
    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({ delete_account: true })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            updateHeaderAndFooter(currentLang);
            window.location.hash = '#'; // redirect to home page
            console.log('Account deleted');
        } else {
            //wip show error alert
            alert('Error deleting account');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting account');
    }
    //hideItem('delete_confirmation_overlay');
    
}

async function anonymizeAccount() {
    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({ anonymize_account: true })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            updateHeaderAndFooter(currentLang);
            window.location.hash = '#'; // redirect to home page
            console.log('Account anonymized');
        } else {
            //wip show error alert
            alert('Error anonymizing account');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error anonymizing account');
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

async function isLoggedIn() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return false;
        }

        try {
        const response = await fetch(apiurl + '/protected/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        } catch (error) {
            throw new Error();
        }
        
        return (true);
        
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}


// collect all the functions in an object
const AuthLb = {
    register,
    logout,
    login2fa,
    verify2fa,
    refreshToken,
    isTokenExpired,
    isLoggedIn,
};

window.AuthLb = AuthLb;