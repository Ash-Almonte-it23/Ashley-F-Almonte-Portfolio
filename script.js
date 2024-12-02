document.addEventListener('DOMContentLoaded', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    const GITHUB_API_URL = "https://api.github.com";
    const githubToken = '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'; // Replace with your GitHub token
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
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
                document.querySelectorAll('.upload-container').forEach(container => container.style.display = 'block');
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

        deleteButton.addEventListener('click', async function () {
            if (!isAdmin) {
                alert('You are not authorized to delete items.');
                return;
            }
            previewGroup.remove();
            await removeFromGitHub(fileName, pageType);
        });

        return deleteButton;
    }

    // GitHub Integration
    async function uploadToGitHub(file, pageType) {
        const fileName = file.name;
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async function () {
                const base64Content = btoa(reader.result);
                const url = `${GITHUB_API_URL}/repos/${owner}/${repoName}/contents/${pageType}/${fileName}`;
                try {
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${githubToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: `Upload ${fileName}`,
                            content: base64Content,
                        }),
                    });
                    const data = await response.json();
                    resolve(data.content.download_url);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    }

    async function removeFromGitHub(fileName, pageType) {
        const url = `${GITHUB_API_URL}/repos/${owner}/${repoName}/contents/${pageType}/${fileName}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${githubToken}`,
            },
        });
        if (!response.ok) {
            console.error(`File not found: ${fileName}`);
            return;
        }
        const fileData = await response.json();
        const sha = fileData.sha;
        await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${fileName}`,
                sha,
            }),
        });
    }

    // File Upload Logic
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).value || 'No Title';
        const fileDescription = document.getElementById(fileDescriptionId).value || 'No Description';

        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const previewHeader = document.createElement('div');
        previewHeader.classList.add('preview-header');
        previewHeader.innerHTML = `<h4>${fileTitle}</h4><p>${fileDescription}</p>`;
        previewGroup.appendChild(previewHeader);

        for (const file of fileUpload.files) {
            try {
                const fileUrl = await uploadToGitHub(file, pageType);
                const previewItem = document.createElement('div');
                previewItem.classList.add('preview-item');

                if (file.type.startsWith('image/')) {
                    previewItem.innerHTML = `<img src="${fileUrl}" alt="${file.name}">`;
                } else if (file.type.startsWith('video/')) {
                    previewItem.innerHTML = `<video src="${fileUrl}" controls></video>`;
                }

                previewGroup.appendChild(previewItem);
            } catch (error) {
                console.error(`Failed to upload file: ${file.name}`, error);
            }
        }

        previewContainer.appendChild(previewGroup);
    }

    // Set up event listeners for upload buttons
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

    // Initialize admin features on page load
    toggleDeleteButtons();
});
