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
    tournaments: {
        en: {
            template: "/html/templates/en/tournaments.html",
            title: "Tournaments | " + pageTitle,
            description: "This is the tournaments page",
        },
        es: {
            template: "/html/templates/es/tournaments.html",
            title: "Torneos | " + pageTitle,
            description: "Esta es la página de torneos",
        },
        fr: {
            template: "/html/templates/fr/tournaments.html",
            title: "Tournois | " + pageTitle,
            description: "Ceci est la page des tournois",
        }
    },
    register: {
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

    // Add other routes here
};

// Function to handle location changes
async function locationHandler() {
    const path = window.location.hash.substring(1) || '/';
    const route = routes[path] ? routes[path][currentLang] : routes['404'][currentLang];

    // Fetch the template
    const template = await fetch(route.template).then((response) => response.text());
    // Set the content div HTML to the template
    document.getElementById("content").innerHTML = template;
    // Set the title to the route title
    document.title = route.title;
    // Set the meta description
    document.querySelector('meta[name="description"]').setAttribute("content", route.description);
}

// Function to update header and footer
async function updateHeaderAndFooter(lang) {
    let headerPath = '/html/templates/' + lang + '/header.html';
    let footerPath = '/html/templates/' + lang + '/footer.html';

    if (AuthLb.isLoggedIn()) {
        headerPath = '/html/templates/' + lang + '/header-loggedin.html';
    }
    // Fetch the header and footer templates
    const headerTemplate = await fetch(headerPath).then((response) => response.text());
    const footerTemplate = await fetch(footerPath).then((response) => response.text());
    // Set the header and footer divs HTML to the templates
    document.getElementById("header").innerHTML = headerTemplate;
    document.getElementById("footer_container").innerHTML = footerTemplate;
    
    attachLanguageSwitcherListeners(); // Re-attach event listeners to language switcher buttons
}

// Function to set language
async function setLanguage(lang) {
    if (languages[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        await locationHandler();
        await updateHeaderAndFooter(lang);
    }
}


// Function to attach event listeners to language switcher buttons
function attachLanguageSwitcherListeners() {
    document.querySelectorAll('.language-switcher').forEach(button => {
        button.addEventListener('click', async (e) => {
            const selectedLang = e.target.getAttribute('data-lang');
            await setLanguage(selectedLang);  // Trigger language change
        });
    });
}

// Listen for hash changes and page load
window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", async () => {
    await locationHandler();
    await updateHeaderAndFooter(currentLang);
});


const RouterLb = {
    updateHeaderAndFooter,
    setLanguage,
};