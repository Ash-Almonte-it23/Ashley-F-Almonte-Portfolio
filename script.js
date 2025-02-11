document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
   

  // Loading Screen Logic
    window.addEventListener('load', function () {
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 999);
            }, 999);
        }
    });

// Dark Mode Toggle Logic
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            darkModeToggle.checked = true;
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function () {
            if (this.checked) {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                body.classList.add('light-mode');
                body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        });
    }

});
