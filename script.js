const THEME_STORAGE_KEY = "preferred-theme";

const getStoredTheme = () => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored === "light" || stored === "dark" ? stored : null;
    } catch {
        return null;
    }
};

const getSystemTheme = () =>
    window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

const applyTheme = (theme, { persist = false } = {}) => {
    document.body.dataset.theme = theme;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
        toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    if (persist) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
};

const initializeTheme = () => {
    try {
        const stored = getStoredTheme();
        const theme = stored ?? getSystemTheme();
        applyTheme(theme, { persist: Boolean(stored) });
    } catch (error) {
        console.error("No fue posible leer el tema almacenado:", error);
        applyTheme(getSystemTheme());
    }
};

const initThemeToggle = () => {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    toggle.setAttribute(
        "aria-pressed",
        document.body.dataset.theme === "dark" ? "true" : "false"
    );

    toggle.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
        try {
            applyTheme(nextTheme, { persist: true });
        } catch (error) {
            console.error("No fue posible actualizar el tema:", error);
            applyTheme(nextTheme);
        }
    });

    if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (event) => {
            if (getStoredTheme()) return;
            applyTheme(event.matches ? "dark" : "light");
        });
    }
};

const TIMEZONE = "America/Lima";
const LOCALE = "es-PE";

const formatTimeForLocation = () => {
    const formatterDate = new Intl.DateTimeFormat(LOCALE, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: TIMEZONE,
    });

    const formatterTime = new Intl.DateTimeFormat(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: TIMEZONE,
    });

    const now = new Date();
    const formattedDate = formatterDate.format(now);
    const formattedTime = formatterTime.format(now);

    return `${capitalizeFirst(formattedDate)}, ${formattedTime}`;
};

const capitalizeFirst = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

const updateClock = () => {
    const clock = document.querySelector("[data-timezone]");
    if (!clock) return;
    clock.textContent = formatTimeForLocation();
};

const enableCardSpotlight = () => {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });

        card.addEventListener("pointerleave", () => {
            card.style.removeProperty("--mouse-x");
            card.style.removeProperty("--mouse-y");
        });
    });
};

initializeTheme();

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    updateClock();
    setInterval(updateClock, 1000);
    enableCardSpotlight();
});
