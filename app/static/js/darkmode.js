document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('darkmode-toggle');
    const body = document.body;

    // Load saved theme preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '🌕';
    } else {
        darkModeToggle.textContent = '🌑';
    }

    darkModeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        darkModeToggle.textContent = isDarkMode ? '🌕' : '🌑';
    });
});
