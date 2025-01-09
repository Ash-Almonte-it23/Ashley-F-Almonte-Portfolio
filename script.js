document.addEventListener('DOMContentLoaded', function () {

     // Test Script to Debug File Upload
    const testUploadButton = document.createElement('button');
    testUploadButton.textContent = 'Test Upload';
    testUploadButton.style = 'position: fixed; top: 20px; left: 20px; z-index: 1000;';
    document.body.appendChild(testUploadButton);

    testUploadButton.addEventListener('click', async function () {
        try {
            const testFileName = 'testFile.txt';
            const testFileContent = 'This is a test file content';
            const githubToken = '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'; // Replace with actual token
            const repoOwner = 'Ash-Almonte-it23';
            const repoName = 'Ashley-F-Almonte-Portfolio';
            const baseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;
            const url = `${baseApiUrl}/${testFileName}`;

            let sha = null;
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
                    message: `Test upload for ${testFileName}`,
                    content: btoa(testFileContent),
                    sha: sha,
                }),
            });

            if (!response.ok) {
                console.error('Test upload failed:', await response.json());
                alert('Test upload failed. Check the console for details.');
            } else {
                alert('Test upload successful!');
            }
        } catch (error) {
            console.error('Error during test upload:', error);
            alert('An error occurred. Check the console for details.');
        }
    });
    // rest of the code 
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API Configuration
    const githubToken = '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'; // Replace with your GitHub token
    const repoOwner = 'Ash-Almonte-it23';
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const baseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

    async function uploadToGitHub(filePath, content) {
        const url = `${baseApiUrl}/${filePath}`;
        let sha = null;

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
            } else {
                alert('Invalid credentials. Please try again.');
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
        const fileTitle = document.getElementById(fileTitleId).textContent.trim();
        const fileDescription = document.getElementById(fileDescriptionId).textContent.trim();

        const files = fileUpload.files;
        let metadata = [];

        for (let file of files) {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const fileUrl = e.target.result;
                const base64Content = fileUrl.split(',')[1];
                const filePath = `${pageType}/${file.name}`;
                const success = await uploadToGitHub(filePath, base64Content);

                if (success) {
                    metadata.push({
                        title: fileTitle || 'Untitled',
                        description: fileDescription || 'No description',
                        fileName: file.name,
                        fileUrl: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${pageType}/${file.name}`,
                    });
                    console.log(`File ${file.name} uploaded successfully.`);
                }
            };
            reader.readAsDataURL(file);
        }

        await uploadToGitHub(`${pageType}/metadata.json`, JSON.stringify(metadata));
        loadPreviewsFromGitHub(previewContainer, pageType);
    }

    async function loadPreviewsFromGitHub(previewContainer, pageType) {
        const metadata = await fetchFromGitHub(`${pageType}/metadata.json`);
        if (!metadata) return;

        previewContainer.innerHTML = '';
        metadata.forEach(({ title, description, fileUrl }) => {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const titleElem = document.createElement('h4');
            titleElem.textContent = title || 'Untitled';
            previewGroup.appendChild(titleElem);

            const descriptionElem = document.createElement('p');
            descriptionElem.textContent = description || 'No description';
            previewGroup.appendChild(descriptionElem);

            if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.jpeg')) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.alt = title;
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
        uploadButtonInternships.addEventListener('click', function () {
            handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
        });
        loadPreviewsFromGitHub(uploadPreviewInternships, 'Internships');
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', function () {
            handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
        });
        loadPreviewsFromGitHub(uploadPreviewProjects, 'Projects');
    }
});
