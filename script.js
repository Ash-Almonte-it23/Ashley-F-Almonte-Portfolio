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

        // Check if file exists
        const checkResponse = await fetch(url, {
            headers: { Authorization: `token ${githubToken}` },
        });

        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add or update ${filePath}`,
                content: btoa(content),
                sha: sha,
            }),
        });

        if (!response.ok) {
            console.error('GitHub upload error:', await response.json());
            return false;
        }
        return true;
    }

    async function fetchFromGitHub(filePath) {
        const url = `${baseApiUrl}/${filePath}`;
        const response = await fetch(url, {
            headers: { Authorization: `token ${githubToken}` },
        });

        if (!response.ok) {
            console.error(`GitHub fetch error for ${filePath}:`, response.statusText);
            return null;
        }

        const data = await response.json();
        return JSON.parse(atob(data.content));
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
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
                toggleDeleteButtons();
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
            removeFromLocalStorage(fileName, pageType);
        });

        return deleteButton;
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
            const command = button.dataset.command;
            button.addEventListener('click', () => {
                if (command === 'increaseFont') {
                    document.execCommand('fontSize', false, '4');
                } else if (command === 'decreaseFont') {
                    document.execCommand('fontSize', false, '2');
                } else {
                    document.execCommand(command, false, null);
                }
                toolbar.style.display = 'none';
            });
        });

        toolbar.querySelector('input[type="color"]').addEventListener('input', (event) => {
            document.execCommand('foreColor', false, event.target.value);
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

    // File Upload and Preview Logic
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerHTML;
        const fileDescription = document.getElementById(fileDescriptionId).innerHTML;

        if (fileUpload.files.length > 0) {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const previewHeader = document.createElement('div');
            previewHeader.classList.add('preview-header');

            const title = document.createElement('h4');
            title.innerHTML = fileTitle || 'No Title';
            previewHeader.appendChild(title);

            const deleteButton = createDeleteButton(previewGroup, fileTitle, pageType);
            previewHeader.appendChild(deleteButton);

            previewGroup.appendChild(previewHeader);

            const description = document.createElement('p');
            description.innerHTML = fileDescription || 'No Description';
            previewGroup.appendChild(description);

            Array.from(fileUpload.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileUrl = e.target.result;
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
                    saveToLocalStorage(file.name, fileTitle, fileDescription, fileUrl, pageType);
                };

                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    reader.readAsDataURL(file);
                } else {
                    alert('Unsupported file format');
                }
            });

            previewContainer.appendChild(previewGroup);
        } else if (fileTitle || fileDescription) {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const previewHeader = document.createElement('div');
            previewHeader.classList.add('preview-header');

            const title = document.createElement('h4');
            title.innerHTML = fileTitle || 'No Title';
            previewHeader.appendChild(title);

            const deleteButton = createDeleteButton(previewGroup, fileTitle, pageType);
            previewHeader.appendChild(deleteButton);

            previewGroup.appendChild(previewHeader);

            const description = document.createElement('p');
            description.innerHTML = fileDescription || 'No Description';
            previewGroup.appendChild(description);

            previewContainer.appendChild(previewGroup);
            saveToLocalStorage(null, fileTitle, fileDescription, null, pageType);
        }

        fileUpload.value = '';
        toggleDeleteButtons();
    }

    async function loadPreviewsFromGitHub(previewContainer, pageType) {
        const metadata = await fetchFromGitHub(`${pageType}/metadata.json`);
        if (!metadata) return;

        previewContainer.innerHTML = '';
        metadata.forEach(({ title, description, fileUrl }) => {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const previewHeader = document.createElement('div');
            previewHeader.classList.add('preview-header');

            const titleElem = document.createElement('h4');
            titleElem.textContent = title || 'No Title';
            previewHeader.appendChild(titleElem);

            const descriptionElem = document.createElement('p');
            descriptionElem.textContent = description || 'No Description';
            previewHeader.appendChild(descriptionElem);

            if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png')) {
                const img = document.createElement('img');
                img.src = fileUrl;
                previewGroup.appendChild(img);
            } else if (fileUrl.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                previewGroup.appendChild(video);
            }

            previewContainer.appendChild(previewGroup);
        });
    }

    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    if (uploadButtonInternships) {
        uploadButtonInternships.addEventListener('click', async function () {
            handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
        });
        await loadPreviewsFromGitHub(uploadPreviewInternships, 'Internships');
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', async function () {
            handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
        });
        await loadPreviewsFromGitHub(uploadPreviewProjects, 'Projects');
    }
});
