const pageTitle = 'Transcendence';

//object that maps routes to templates
const routes = {

    404: {
        template: "/html/templates/404.html",
        title: "404 | " + pageTitle,
        description: "Page not found",
    },
    "/": {
        template: "/html/templates/home.html",
        title: "Home | " + pageTitle,
        description: "This is the home page",
    },
    tournaments: {
        template: "/html/templates/tournaments.html",
        title: "tournaments | " + pageTitle,
        description: "This is the tournaments page",
    },
    login: {
        template: "/html/templates/login.html",
        title: "Login | " + pageTitle,
        description: "This is the login page",
    },
    register: {
        template: "/html/templates/register.html",
        title: "Register | " + pageTitle,
        description: "This is the register page",
    },
    scores: {
        template: "/html/templates/scores.html",
        title: "Scores | " + pageTitle,
        description: "This is the scores page",
    },

};


const locationHandler = async () => {
    var location = window.location.hash.replace("#", "");

    if (location.length == 0) {
        location = "/";
    }
    //get the route
    const route = routes[location] || routes[404];
    //get the template
    const template = await fetch(route.template).then((response) => response.text());
    //set the content div html to the template
    document.getElementById("content").innerHTML = template;
    //set the title to the route title
    document.title = route.title;
    //set the meta description
    document.querySelector('meta[name="description"]').setAttribute("content", route.description);

    //call the translation function
    const lang = document.querySelector('.language-switcher.active')?.getAttribute('data-lang') || 'en';
    await switchLanguage(lang);
};

//listen for hash changes
window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", locationHandler); // ----

locationHandler();
