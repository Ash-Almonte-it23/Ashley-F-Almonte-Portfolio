document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API Configuration
    const githubToken = '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'; // Replace with your token
    const repoOwner = 'Ash-Almonte-it23';
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const baseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

    async function uploadToGitHub(filePath, content) {
        const url = `${baseApiUrl}/${filePath}`;
        let sha = null;

        // Check if file already exists
        const checkResponse = await fetch(url, {
            headers: { Authorization: `token ${githubToken}` },
        });

        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha; // Get SHA for the existing file
        }

        // Upload or update the file
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add or update ${filePath}`,
                content: btoa(content), // Encode content to Base64
                sha: sha, // Include SHA if updating
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('GitHub upload error:', data);
            return false;
        }

        console.log('GitHub upload success:', data);
        return true;
    }

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

    // Toggle delete buttons visibility and functionality based on admin status
    function toggleDeleteButtons() {
        document.querySelectorAll('.delete-button').forEach(button => {
            if (isAdmin) {
                button.style.display = 'block';
                button.disabled = false;
            } else {
                button.style.display = 'none';
                button.disabled = true;
            }
        });
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
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerHTML.trim();
        const fileDescription = document.getElementById(fileDescriptionId).innerHTML.trim();

        const files = fileUpload.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const fileUrl = e.target.result;
                const base64Content = fileUrl.split(',')[1]; // Extract Base64 content
                const filePath = `${pageType}/${file.name}`;
                const success = await uploadToGitHub(filePath, base64Content);
                if (success) {
                    console.log(`File ${file.name} uploaded successfully.`);
                }
            };
            reader.readAsDataURL(file); // Read file as Base64
        }

        // Upload metadata as JSON
        const metadata = {
            title: fileTitle || 'Untitled',
            description: fileDescription || 'No description',
        };
        await uploadToGitHub(`${pageType}/metadata.json`, JSON.stringify(metadata));
    }

    // Initialize upload buttons and preview loading
    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    if (uploadButtonInternships) {
        uploadButtonInternships.addEventListener('click', function () {
            handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
        });
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', function () {
            handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
        });
    }
});
