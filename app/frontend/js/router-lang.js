// Available languages
const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
};

// Default language
//let currentLang = localStorage.getItem('lang') || 'en';
let currentLang = localStorage.getItem('lang') || navigator.language.slice(0, 2) || 'en';

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
    // Add other routes here
};

// Function to handle language change
const setLanguage = (lang) => {
    if (languages[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);  // Save the selected language
        locationHandler();  // Reload the page content for the selected language
    }
};

// Language switcher event listener
document.getElementById('languageSwitcher').addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

const locationHandler = async () => {
    var location = window.location.hash.replace("#", "");

    if (location.length == 0) {
        location = "/";
    }
    // Get the route for the current location and language, or fallback to 404
    const route = routes[location] ? routes[location][currentLang] : routes[404][currentLang];
    // Fetch the template
    const template = await fetch(route.template).then((response) => response.text());
    // Set the content div HTML to the template
    document.getElementById("content").innerHTML = template;
    // Set the title to the route title
    document.title = route.title;
    // Set the meta description
    document.querySelector('meta[name="description"]').setAttribute("content", route.description);
};

// Listen for hash changes and page load
window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", locationHandler);


// Add event listener to each language switcher button
document.querySelectorAll('.language-switcher').forEach(button => {
    button.addEventListener('click', (e) => {
        const selectedLang = e.target.getAttribute('data-lang');
        setLanguage(selectedLang);  // Trigger language change
    });
});

locationHandler();  // Initial load




