document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API configuration
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
    const token = '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';

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
                toggleAdminFeatures();
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // Toggle admin features (upload containers and delete buttons)
    function toggleAdminFeatures() {
        const uploadContainers = document.querySelectorAll('.upload-container');
        const deleteButtons = document.querySelectorAll('.delete-button');

        if (isAdmin) {
            document.body.classList.add('admin-enabled');
            uploadContainers.forEach(container => container.style.display = 'block');
            deleteButtons.forEach(button => {
                button.style.display = 'block';
                button.disabled = false;
            });
        } else {
            document.body.classList.remove('admin-enabled');
            uploadContainers.forEach(container => container.style.display = 'none');
            deleteButtons.forEach(button => {
                button.style.display = 'none';
                button.disabled = true;
            });
        }
    }

    // Popup Toolbar Setup
    function setupPopupToolbar(containerId, toolbarId) {
        const container = document.getElementById(containerId);
        const toolbar = document.getElementById(toolbarId);

        if (!container || !toolbar) return;

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

    // File Upload Logic with GitHub Integration
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).value || 'No Title';
        const fileDescription = document.getElementById(fileDescriptionId).value || 'No Description';

        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const previewHeader = document.createElement('div');
        previewHeader.classList.add('preview-header');

        const titleElem = document.createElement('h4');
        titleElem.innerHTML = fileTitle;
        previewHeader.appendChild(titleElem);

        const descriptionElem = document.createElement('p');
        descriptionElem.innerHTML = fileDescription;
        previewHeader.appendChild(descriptionElem);

        previewGroup.appendChild(previewHeader);

        for (const file of fileUpload.files) {
            try {
                const fileUrl = await uploadToGitHub(file, fileTitle, fileDescription);
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
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
            }
        }

        previewContainer.appendChild(previewGroup);
    }

    async function uploadToGitHub(file, title, description) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async function () {
                const base64Content = btoa(reader.result);
                try {
                    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.name}`, {
                        method: 'PUT',
                        headers: {
                            Authorization: `token ${token}`,
                        },
                        body: JSON.stringify({
                            message: `Adding ${file.name}`,
                            content: base64Content,
                        }),
                    });
                    const data = await response.json();
                    resolve(data.content.download_url);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    }

    // Event Listeners for Upload Buttons
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

    // Initialize admin features
    toggleAdminFeatures();
});
