/* ==========================================================
   APP.JS
   Purpose:
   Ito ang nagbabasa ng CONFIG at naglalagay ng data sa website.
   Dito manggagaling ang branding ng buong template.
========================================================== */


/* ==========================================================
   BRANDING
   Shop Name
   Logo
========================================================== */

function loadBranding() {

    // Browser tab title
    document.getElementById("page-title").textContent = CONFIG.shopName;

    // Header logo
    document.getElementById("site-logo").src = CONFIG.logo;
    document.getElementById("site-logo").alt = CONFIG.shopName;

}


/* ==========================================================
   HERO SECTION
   Video
   Title
   Subtitle
   Button
========================================================== */

function loadHero() {

    // Hero background video (Updated per Grok's instruction)
    const heroSource = document.getElementById("hero-video");
    const heroVideo = document.getElementById("hero-video-player");

    heroSource.src = CONFIG.hero.video;
    
    // Sabihan ang browser na i-reload ang video
    if (heroVideo) {
        heroVideo.load();
    }

    // Hero heading
    document.getElementById("hero-title").textContent = CONFIG.hero.title;

    // Hero subtitle
    document.getElementById("hero-subtitle").textContent = CONFIG.hero.subtitle;

    // Hero button
    document.getElementById("hero-btn").textContent = CONFIG.hero.button;

}


/* ==========================================================
   INITIALIZE WEBSITE
   Tinatawag lahat ng functions dito kapag nag-load ang page.
========================================================== */

function init(){

    loadBranding();

    loadHero();

    loadTheme();

}


// Run website (Updated to use DOMContentLoaded per Grok's suggestion)
document.addEventListener("DOMContentLoaded", () => {
    init();
});
/* ==========================================================
   THEME
   Update CSS Variables from CONFIG
========================================================== */

function loadTheme() {

    // Primary Brand Color
    document.documentElement.style.setProperty(
        "--color-primary",
        CONFIG.colors.primary
    );

    // Text color ng primary buttons
    document.documentElement.style.setProperty(
        "--color-primary-inverse",
        CONFIG.colors.secondary
    );

}