const THEMES = {
	LIGHT: "light",
	DARK: "dark",
};

const THEME_STORAGE_KEY = "porto-theme";
const THEME_EVENT = "themechange";

function isBrowser() {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

function isValidTheme(theme) {
	return theme === THEMES.LIGHT || theme === THEMES.DARK;
}

function readStoredTheme() {
	if (!isBrowser()) return null;

	const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
	return isValidTheme(storedTheme) ? storedTheme : null;
}

function getActiveTheme() {
	if (!isBrowser()) return THEMES.LIGHT;
	return document.documentElement.classList.contains("dark") ? THEMES.DARK : THEMES.LIGHT;
}

function notifyThemeChange(theme) {
	if (!isBrowser()) return;
	window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

function applyTheme(theme, { persist = true } = {}) {
	if (!isBrowser()) return THEMES.LIGHT;

	const nextTheme = isValidTheme(theme) ? theme : THEMES.LIGHT;
	document.documentElement.classList.toggle("dark", nextTheme === THEMES.DARK);

	if (persist) {
		window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
	}

	notifyThemeChange(nextTheme);
	return nextTheme;
}

function initTheme() {
	const storedTheme = readStoredTheme();
	const initialTheme = storedTheme ?? THEMES.LIGHT;
	return applyTheme(initialTheme, { persist: Boolean(storedTheme) });
}

function toggleTheme() {
	const currentTheme = getActiveTheme();
	const nextTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
	return applyTheme(nextTheme);
}

export {
	THEMES,
	THEME_EVENT,
	THEME_STORAGE_KEY,
	applyTheme,
	getActiveTheme,
	initTheme,
	readStoredTheme,
	toggleTheme,
};
