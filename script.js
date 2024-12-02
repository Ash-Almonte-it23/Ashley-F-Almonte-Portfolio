document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API configuration
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
    const token = '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'; // Replace with your token

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
                toggleAdminFeatures();
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // Toggle admin features visibility
    function toggleAdminFeatures() {
        const uploadContainers = document.querySelectorAll('.upload-container');
        const deleteButtons = document.querySelectorAll('.delete-button');
        uploadContainers.forEach(container => {
            container.style.display = isAdmin ? 'block' : 'none';
        });
        deleteButtons.forEach(button => {
            button.style.display = isAdmin ? 'block' : 'none';
        });
    }

    toggleAdminFeatures();

    // File Upload with GitHub Integration
    async function handleFileUpload(fileUploadId, titleId, descriptionId, previewContainer, folder = '') {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(titleId).innerText.trim() || 'No Title';
        const fileDescription = document.getElementById(descriptionId).innerText.trim() || 'No Description';

        if (fileUpload.files.length > 0 || fileTitle || fileDescription) {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const previewHeader = document.createElement('div');
            previewHeader.classList.add('preview-header');

            const titleElem = document.createElement('h4');
            titleElem.innerText = fileTitle;
            previewHeader.appendChild(titleElem);

            const descriptionElem = document.createElement('p');
            descriptionElem.innerText = fileDescription;
            previewGroup.appendChild(previewHeader);
            previewGroup.appendChild(descriptionElem);

            for (const file of fileUpload.files) {
                const fileUrl = await uploadToGitHub(file, folder);
                if (fileUrl) {
                    const previewItem = document.createElement('div');
                    previewItem.classList.add('preview-item');
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = fileUrl;
                        img.alt = file.name;
                        previewItem.appendChild(img);
                    } else if (file.type.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.src = fileUrl;
                        video.controls = true;
                        previewItem.appendChild(video);
                    }
                    previewGroup.appendChild(previewItem);
                }
            }
            previewContainer.appendChild(previewGroup);
        }
    }

    async function uploadToGitHub(file, folder = '') {
        const filePath = `${folder}/${file.name}`;
        const fileContent = await readFileAsBase64(file);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add ${file.name}`,
                content: fileContent
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.content.download_url;
        } else {
            console.error('Failed to upload:', response.statusText);
            return null;
        }
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(btoa(reader.result));
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    }

    // Popup Toolbar Setup
    function setupPopupToolbar(containerId, toolbarId) {
        const container = document.getElementById(containerId);
        const toolbar = document.getElementById(toolbarId);

        if (container && toolbar) {
            container.addEventListener('mouseup', () => {
                const selection = window.getSelection();
                if (selection.toString().length > 0) {
                    const rect = container.getBoundingClientRect();
                    toolbar.style.top = `${rect.top + window.scrollY - toolbar.offsetHeight}px`;
                    toolbar.style.left = `${rect.left + window.scrollX}px`;
                    toolbar.style.display = 'block';
                } else {
                    toolbar.style.display = 'none';
                }
            });

            toolbar.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    document.execCommand(button.title.toLowerCase(), false, null);
                });
            });
        }
    }

    setupPopupToolbar('fileTitleInternships', 'popupToolbarTitleInternships');
    setupPopupToolbar('fileDescriptionInternships', 'popupToolbarDescriptionInternships');
    setupPopupToolbar('fileTitleProjects', 'popupToolbarTitleProjects');
    setupPopupToolbar('fileDescriptionProjects', 'popupToolbarDescriptionProjects');
});
