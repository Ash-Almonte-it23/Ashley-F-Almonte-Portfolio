document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    const DROPBOX_ACCESS_TOKEN = 'sl.u.AFinSRo6OuvRMjBwmvROjf1RL0BSPT6gWFobKlIvfGYZMuF0e-x_IL3ZYQTISiCpqHanvvg3Gy_GSnh0VaoVX_6CYk36MC_Uqjs2ZBElBZhBKgh_50RbeVF512rCiaQ3AV21Ei2_6oeFMe2Ih_ZErGDnPOn9uuGJzIXB3LAVIniPrhaLQXcC6uNfC9h93BbvsV30o2FsAGUXWWvhxAZHVwWJ5FQA1D8OGumXvmLCHVTv3j9q9ltzdph8JWeyjrtS3s8GSG2rik83lphh0BSVXwplmE--kmqJIT4T21isj7XbQPDBSFYXEHz31xrvYMgVkdFEtwLWsfMEgrf44bSNKXcXdxWxRn2hjVwWyrRFS39tDm-aHC4ylS3PbOkGKF-YoNWfTVxhPwQUhLWUgYmWzjGrvKY_mpALpB5-aBq45E4PFEgDuzgG7hQxStZe7FGfOckwipi7HqrwIaB5Ik2B1AyQapr3G1WTCjyxGytFw-DrlJNUkdiiqaikXw0stEDeLAOSGAsdaYKEl5jWGu6Iei18kMhwN14jfxnn5cPeMR7onDpe4CZRT18MMU9qPtonFFqcdWMhhA-XUMADwhbgZsrAuiYg2RlRDYrhDgloYcYezx-mqadnzkpMSLJzUfvayTa1N9866AjwzzX7v3JrBz5C_Ib9gtL5SBlB1i5_ap5EIjC5gr1cDVNmipfo3VMNaXlP67zbEdG05CAZRfI9Wx1WGPXFgYSlOoMrtJ-9x4IvA9Wlms_m7qGYxZHgS4mjMxQjkIohh8PBQUz-DCliFCgjgAUzkI2PxFFiGMI0xtXgOtV0gsChdZcs-VGSL42bvByGtt-GaqdlAK8n1Uy24NgOy0MzFyXf34trZO1mOuA_cfXvGLm-RvknNhlYZBBt1Y-ri1w2PmAK578Yefw0X9IBHvX8EjUigFbYldUvyxspwQWkE27PtMRbehm_8BFbCQv4a75cLRs5BJ3rGGPvk8vruBnDrR48xdA9Jdqi0kDQvtKCYZnhwMZmG6TAWyGZlv1qCdjEsmvMFfJrwTuy4WwMA_UAdZiH6P9lFHVpa75KPn_SBfUx7_b_An3zh1vK9s5mbHGQtzqd4KyNTsP7NOhmVNB0Gu8zjNAFDKxi3mlhfdHmj-17sg3w6LZCt2vQBAnDd6lvEn6iszfwzq8uZZinVNkfz4E_c6MspQcKUloDNYf9c5PRwJemXLKcnd0i3RWvw_dAqopVG-hsp0z-_h2K1_GI1yEt31njrNGrUt_O3otGYI9Db3VZ7yX2VZcFJu-gkY4w3cXI6DLpayxfgAGgaLp63jqy9DVke0IEDj3xZokPibWt1sFjTTFKqKqHKCmPMUzC7aFMw-4vpOSZKWgWNWFwUtp_sOVS8tncOdZZoktkUBikPOKzP8ha24gAbqtjVOG2rSdBSnh6RuL-QTi_sE1XbkHX49kqivQNRm7ps-HseD993B3m8Bn4Zq4aObo';

  // Loading Screen Logic
    window.addEventListener('load', function () {
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1000);
            }, 1000);
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

    // Admin Login Functionality
    const loginButton = document.getElementById('loginButton');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    if (loginButton) {
        loginButton.addEventListener('click', function () {
            const username = usernameField.value.trim();
            const password = passwordField.value.trim();

            if (username === 'AAadmin' && password === '2025AAadmin') {
                alert('Login successful');
                isAdmin = true;
                localStorage.setItem('isAdmin', 'true');
                document.body.classList.add('admin-enabled');
                document.querySelector('.upload-container').style.display = 'block';
                toggleDeleteButtons();
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // Function to toggle delete buttons based on admin status
    function toggleDeleteButtons() {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.style.display = isAdmin ? 'block' : 'none';
            button.disabled = !isAdmin;
        });
    }

    // Dropbox File Upload Function
    async function uploadToDropbox(file) {
        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: `/AshleyPortfolioUploader/${file.name}`,
                        mode: 'add',
                        autorename: true,
                        mute: false
                    }),
                    'Content-Type': 'application/octet-stream'
                },
                body: file
            });

            if (!response.ok) {
                throw new Error(`Dropbox Upload Failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.path_display;
        } catch (error) {
            console.error('Dropbox upload error:', error);
            return null;
        }
    }

    // Dropbox File Delete Function
    async function deleteFromDropbox(filePath) {
        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: filePath })
            });

            if (!response.ok) {
                throw new Error(`Dropbox Delete Failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Dropbox delete error:', error);
        }
    }

    // Function to Create Delete Button
    function createDeleteButton(previewGroup, filePath) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.style.display = isAdmin ? 'block' : 'none';

        deleteButton.addEventListener('click', function () {
            if (!isAdmin) {
                alert('You are not authorized to delete items.');
                return;
            }
            deleteFromDropbox(filePath);
            previewGroup.remove();
        });

        return deleteButton;
    }

    // Popup Toolbar Setup
    function setupPopupToolbar(containerId, toolbarId) {
        const container = document.getElementById(containerId);
        const toolbar = document.getElementById(toolbarId);
        if (!container || !toolbar) return;

        container.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().length > 0) {
                toolbar.style.top = `${container.getBoundingClientRect().top + window.scrollY - 50}px`;
                toolbar.style.left = `${container.getBoundingClientRect().left + window.scrollX}px`;
                toolbar.style.display = 'block';
            } else {
                toolbar.style.display = 'none';
            }
        });

        toolbar.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                document.execCommand(button.title.toLowerCase(), false, null);
                toolbar.style.display = 'none';
            });
        });

        document.addEventListener('mousedown', function (event) {
            if (!toolbar.contains(event.target) && !container.contains(event.target)) {
                toolbar.style.display = 'none';
            }
        });
    }

    setupPopupToolbar('fileTitleInternships', 'popupToolbarTitleInternships');
    setupPopupToolbar('fileDescriptionInternships', 'popupToolbarDescriptionInternships');
    setupPopupToolbar('fileTitleProjects', 'popupToolbarTitleProjects');
    setupPopupToolbar('fileDescriptionProjects', 'popupToolbarDescriptionProjects');

    // Initialize Admin Features & Delete Buttons
    toggleAdminFeatures();
    toggleDeleteButtons();
});
