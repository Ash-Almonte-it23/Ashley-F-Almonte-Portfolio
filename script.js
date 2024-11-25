document.addEventListener('DOMContentLoaded', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    const GITHUB_API_URL = "https://api.github.com";
    const githubToken = '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'; // Replace with your GitHub token
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';

     const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

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
                toggleDeleteButtons();
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // Toggle delete buttons visibility and functionality based on admin status
    function toggleDeleteButtons() {
        document.querySelectorAll('.delete-button').forEach(button => {
            if (isAdmin) {
                button.style.display = 'block';
                button.disabled = false;
                button.classList.remove('disabled');
            } else {
                button.style.display = 'none';
                button.disabled = true;
                button.classList.add('disabled');
            }
        });
    }

    // Function to create delete button
    function createDeleteButton(previewGroup, fileName, pageType) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.style.display = isAdmin ? 'block' : 'none';
        deleteButton.disabled = !isAdmin;

        deleteButton.addEventListener('click', function () {
            if (!isAdmin) {
                alert('You are not authorized to delete items.');
                return;
            }
            previewGroup.remove();
            removeFromGitHub(fileName, pageType);
        });

        return deleteButton;
    }

    // GitHub Integration
    async function uploadToGitHub(fileName, content, pageType) {
        const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${pageType}/${fileName}`;
        const base64Content = btoa(content);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add ${fileName}`,
                content: base64Content,
            }),
        });

        if (response.ok) {
            console.log(`File ${fileName} uploaded successfully.`);
        } else {
            console.error(`Failed to upload ${fileName}`, await response.json());
        }
    }

    async function removeFromGitHub(fileName, pageType) {
        const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${pageType}/${fileName}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            console.error(`File not found: ${fileName}`);
            return;
        }

        const fileData = await response.json();
        const sha = fileData.sha;

        const deleteResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${fileName}`,
                sha: sha,
            }),
        });

        if (deleteResponse.ok) {
            console.log(`File ${fileName} deleted successfully.`);
        } else {
            console.error(`Failed to delete ${fileName}`, await deleteResponse.json());
        }
    }

    // Popup Toolbar Setup
    function setupPopupToolbar(containerId, toolbarId) {
        const container = document.getElementById(containerId);
        const toolbar = document.getElementById(toolbarId);

        if (!container || !toolbar) {
            console.error(`Element not found: ${containerId}, ${toolbarId}`);
            return;
        }

        container.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().length > 0) {
                const containerRect = container.getBoundingClientRect();
                toolbar.style.top = `${containerRect.top + window.scrollY - toolbar.offsetHeight - 50}px`;
                toolbar.style.left = `${containerRect.left + window.scrollX}px`;
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

        toolbar.querySelector('input[type="color"]').addEventListener('input', (event) => {
            document.execCommand('foreColor', false, event.target.value);
        });
    }

    setupPopupToolbar('fileTitleInternships', 'popupToolbarTitleInternships');
    setupPopupToolbar('fileDescriptionInternships', 'popupToolbarDescriptionInternships');
    setupPopupToolbar('fileTitleProjects', 'popupToolbarTitleProjects');
    setupPopupToolbar('fileDescriptionProjects', 'popupToolbarDescriptionProjects');

    // File Upload Logic and Preview Loading
    function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerHTML;
        const fileDescription = document.getElementById(fileDescriptionId).innerHTML;

        if (fileUpload.files.length > 0) {
            Array.from(fileUpload.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileUrl = e.target.result;
                    const fileName = `${file.name}`;
                    uploadToGitHub(fileName, e.target.result, pageType);
                };
                reader.readAsDataURL(file);
            });
        } else if (fileTitle || fileDescription) {
            const metadata = JSON.stringify({ title: fileTitle, description: fileDescription });
            uploadToGitHub('metadata.json', metadata, pageType);
        }
    }
});
