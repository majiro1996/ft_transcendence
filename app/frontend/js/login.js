
const backendUrl = BACKEND_API_URL;
const backendPort = BACKEND_PORT;

//let apiurl = `${backendUrl}:${backendPort}`;
let apiurl = "//" + backendUrl;

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

        //if status is not ok
        if (!response.ok) {
            showAlert(result.error);
        } else {
            showAlert(result.success);
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            window.location.hash = '#';  // redirect to home page
            RouterLb.setPreferredLanguage();
        }
    } catch (error) {
       //get the alert id from the erro message
       showAlert(error);
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

        if (!response.ok) {
            showAlert(result.error);
        } else if (result.success === '2fa-required') {
            showAlert(result.success);
            window.location.hash = '#auth2fa';
        } else if (result.access_token && result.refresh_token) {
            showAlert(result.success);
            // Handle successful login without 2FA
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            window.location.hash = '#'  // redirect to home page
            RouterLb.updateHeaderAndFooter(currentLang);
            RouterLb.setPreferredLanguage();
        }

    } catch (error) {
        alert('Error: ' + error);
        console.error('Error:', error);
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
            showAlert(result.error);
            return;
        }
        if (!result.access_token || !result.refresh_token) {
            showAlert("login-error");
            return;
        }
        showAlert(result.success);
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        console.log('Login successful');
        window.location.hash = '#';  // redirect to home page
        RouterLb.updateHeaderAndFooter(currentLang);
        RouterLb.setPreferredLanguage();
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error);
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

        if (!response.ok) {
            showAlert(data.error);
            return;
        }
        if (data.success) {
            showAlert(data.success);
        }
        // Clear tokens from localStorage or sessionStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Redirect to login page or home
        window.location.hash = '#login';
        RouterLb.updateHeaderAndFooter(currentLang);
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

        if (!response.ok) {
            showAlert(data.error);
            return;
        }
        if (data.success) {
            showAlert(data.success);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            updateHeaderAndFooter(currentLang);
            window.location.hash = '#'; // redirect to home page
            console.log('Account deleted');
        }

    } catch (error) {
        console.error('Error:', error);
        alert(error);
    } 
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

        if (!response.ok) {
            showAlert(data.error);
            return;
        }
        if (data.success) {
            showAlert(data.success);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            updateHeaderAndFooter(currentLang);
            window.location.hash = '#'; // redirect to home page
            console.log('Account anonymized');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error);
    }
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
    isLoggedIn,
};

window.AuthLb = AuthLb;