// Available languages
const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
};

// Default language
let currentLang = localStorage.getItem('lang') || navigator.language.slice(0, 2) || 'en';

// Check if the selected language is supported if not, fallback to English
if (!languages[currentLang]) {
    currentLang = 'en';
}

// Page title
const pageTitle = "Transcendence";

// Object that maps routes to templates (with language support)
const routes = {
    404: {
        onLoad: null,
        en: {
            template: "/html/templates/en/404.html",
            title: "404 | " + pageTitle,
            description: "Page not found",
        },
        es: {
            template: "/html/templates/es/404.html",
            title: "404 | " + pageTitle,
            description: "Página no encontrada",
        },
        fr: {
            template: "/html/templates/fr/404.html",
            title: "404 | " + pageTitle,
            description: "Page non trouvée",
        }
    },
    "/": {
        onLoad: null,
        en: {
            template: "/html/templates/en/home.html",
            title: "Home | " + pageTitle,
            description: "This is the home page",
        },
        es: {
            template: "/html/templates/es/home.html",
            title: "Inicio | " + pageTitle,
            description: "Esta es la página de inicio",
        },
        fr: {
            template: "/html/templates/fr/home.html",
            title: "Accueil | " + pageTitle,
            description: "Ceci est la page d'accueil",
        }
    },

    register: {
        onLoad: null,
        en: {
            template: "/html/templates/en/register.html",
            title: "Register | " + pageTitle,
            description: "This is the register page",
        },
        es: {
            template: "/html/templates/es/register.html",
            title: "Registro | " + pageTitle,
            description: "Esta es la página de registro",
        },
        fr: {
            template: "/html/templates/fr/register.html",
            title: "Inscription | " + pageTitle,
            description: "Ceci est la page d'inscription",
        }
    },
    login: {
        onLoad: null,
        en: {
            template: "/html/templates/en/login.html",
            title: "Login | " + pageTitle,
            description: "This is the login page",
        },
        es: {
            template: "/html/templates/es/login.html",
            title: "Iniciar sesión | " + pageTitle,
            description: "Esta es la página de inicio de sesión",
        },
        fr: {
            template: "/html/templates/fr/login.html",
            title: "Connexion | " + pageTitle,
            description: "Ceci est la page de connexion",
        }
    },
    profile: {
        onLoad: LoadProfile,
        en: {
            template: "/html/templates/en/profile.html",
            title: "Profile | " + pageTitle,
            description: "This is the profile page",
        },
        es: {
            template: "/html/templates/es/profile.html",
            title: "Perfil | " + pageTitle,
            description: "Esta es la página de perfil",
        },
        fr: {
            template: "/html/templates/fr/profile.html",
            title: "Profil | " + pageTitle,
            description: "Ceci est la page de profil",
        }
    },
    auth2fa: {
        onLoad: null,
        en: {
            template: "/html/templates/en/2fa.html",
            title: "2FA | " + pageTitle,
            description: "This is the 2FA page",
        },
        es: {
            template: "/html/templates/es/2fa.html",
            title: "2FA | " + pageTitle,
            description: "Esta es la página 2FA",
        },
        fr: {
            template: "/html/templates/fr/2fa.html",
            title: "2FA | " + pageTitle,
            description: "Ceci est la page 2FA",
        }
    },

    pong: {
        onLoad: LoadPong,
        en: {
            template: "/pong/pong.html",
            title: "Pong | " + pageTitle,
            description: "This is Pong.",
        },
        es: {
            template: "/pong/pong.html",
            title: "Pong | " + pageTitle,
            description: "This is Pong.",
        },
        fr: {
            template: "/pong/pong.html",
            title: "Pong | " + pageTitle,
            description: "This is Pong.",
        }
    },

    tictactoe: {
        onLoad: LoadTicTacToe,
        en: {
            template: "/html/templates/en/tictactoe.html",
            title: "Tic-Tac-Toe | " + pageTitle,
            description: "This is Tic-Tac-Toe.",
        },
        es: {
            template: "/html/templates/es/tictactoe.html",
            title: "Tic-Tac-Toe | " + pageTitle,
            description: "This is Tic-Tac-Toe."
        },
        fr: {
            template: "/html/templates/fr/tictactoe.html",
            title: "Tic-Tac-Toe | " + pageTitle,
            description: "This is Tic-Tac-Toe.",
        }
    },

    settings: {
        onLoad: CommonLb.getProfileSettings,
        en: {
            template: "/html/templates/en/settings.html",
            title: "Settings | " + pageTitle,
            description: "This is the settings page",
        },
        es: {
            template: "/html/templates/es/settings.html",
            title: "Ajustes | " + pageTitle,
            description: "Esta es la página de ajustes",
        },
        fr: {
            template: "/html/templates/fr/settings.html",
            title: "Paramètres | " + pageTitle,
            description: "Ceci est la page des paramètres",
        }
    },

    createTournament: {
        onLoad: undefined,
        en: {
            template: "/html/templates/en/tournament_create.html",
            title: "Create Tournament | " + pageTitle,
            description: "This is the create tournament page",
        },
        es: {
            template: "/html/templates/es/tournament_create.html",
            title: "Crear Torneo | " + pageTitle,
            description: "Esta es la página de creación de torneos",
        },
        fr: {
            template: "/html/templates/fr/tournament_create.html",
            title: "Créer un tournoi | " + pageTitle,
            description: "Ceci est la page de création de tournois",
        }
    },

    tournaments: {
        onLoad: LoadTournamentsHome,
        en: {
            template: "/html/templates/en/tournament_home.html",
            title: "Tournaments | " + pageTitle,
            description: "This is the tournaments page",
        },
        es: {
            template: "/html/templates/es/tournament_home.html",
            title: "Torneos | " + pageTitle,
            description: "Esta es la página de torneos",
        },
        fr: {
            template: "/html/templates/fr/tournament_home.html",
            title: "Tournois | " + pageTitle,
            description: "Ceci est la page des tournois",
        }
    },
    friends: {
        onLoad: LoadFriends,
        en: {
            template: "/html/templates/en/friends.html",
            title: "Friends | " + pageTitle,
            description: "This is the friends page",
        },
        es: {
            template: "/html/templates/es/friends.html",
            title: "Amigos | " + pageTitle,
            description: "Esta es la página de amigos",
        },
        fr: {
            template: "/html/templates/fr/friends.html",
            title: "Amis | " + pageTitle,
            description: "Ceci est la page des amis",
        }
    },
    
    // Add other routes here
};

// Function to handle location changes
async function locationHandler() {
    const path = window.location.hash.substring(1) || '/';
    const route = routes[path] ? routes[path][currentLang] : routes['404'][currentLang];

    //check if the path does indeed exist as a file
    const response = await fetch(route.template);
    if (!response.ok) {
        route = routes['404'][currentLang];
    }

    // Fetch the template
    const template = await fetch(route.template).then((response) => response.text());
    // Set the content div HTML to the template
    document.getElementById("content").innerHTML = template;
    // Set the title to the route title
    document.title = route.title;
    // Set the meta description
    document.querySelector('meta[name="description"]').setAttribute("content", route.description);
    // Call the onLoad function if it exists and is a function
    if (routes[path] && typeof routes[path].onLoad === 'function') {
        routes[path].onLoad();
    }
}

// Function to update header and footer
async function updateHeaderAndFooter(lang) {
    try {
        let headerPath = '/html/templates/' + lang + '/header.html';
        let footerPath = '/html/templates/' + lang + '/footer.html';

        let loggedIn = await AuthLb.isLoggedIn();
        if (loggedIn) {
            headerPath = '/html/templates/' + lang + '/header-loggedin.html';
        }

        // Fetch the header and footer templates
        let headerTemplate = await fetch(headerPath).then((response) => response.text());
        let footerTemplate = await fetch(footerPath).then((response) => response.text());
        // Set the header and footer divs HTML to the templates
        document.getElementById("header").innerHTML = headerTemplate;
        document.getElementById("footer_container").innerHTML = footerTemplate;

        attachLanguageSwitcherListeners(); // Re-attach event listeners to language switcher buttons
    }
    catch (error) {
        showAlert("something-went-wrong");;
    }
}

// Function to update the alert container
async function updateAlertContainer(lang) {
    const alertPath = '/html/templates/' + lang + '/alert.html';
    const alertTemplate = await fetch(alertPath).then((response) => response.text());
    document.getElementById("alert_container").innerHTML = alertTemplate;
}

// Function to set language
async function setLanguage(lang) {
    if (languages[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        await locationHandler();
        await updateHeaderAndFooter(lang);
        await updateAlertContainer(lang);
    }
}


// Function to attach event listeners to language switcher buttons
function attachLanguageSwitcherListeners() {
    document.querySelectorAll('.h_flag_button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const selectedLang = e.target.getAttribute('data-lang');
            await setLanguage(selectedLang);  // Trigger language change
        });
    });
}


async function setPreferredLanguage() {
    try {
        const response = await fetch(apiurl + '/profile-settings/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        if (!response.ok) {
            throw new Error('Something went wrong');
        }

        const data = await response.json();
        currentLang = data.language_preference;
        RouterLb.setLanguage(data.language_preference);
    } catch (error) {
        showAlert("something-went-wrong");;
    }
}

// Listen for hash changes and page load
window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", async () => {
    await locationHandler();
    await updateHeaderAndFooter(currentLang);
    await updateAlertContainer(currentLang);
});


const RouterLb = {
    updateHeaderAndFooter,
    setLanguage,
    setPreferredLanguage
};