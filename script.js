document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API configuration
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
    const token = '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'; // Replace with your GitHub token

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
                button.classList.remove('disabled');
            } else {
                button.style.display = 'none';
                button.disabled = true;
                button.classList.add('disabled');
            }
        });
    }

    // GitHub API Helper Functions
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
                message: `Adding file: ${file.name}`,
                content: fileContent,
            })
        });

        if (!response.ok) {
            console.error(`Failed to upload ${file.name}:`, await response.json());
            alert(`Failed to upload ${file.name}. Check the console for details.`);
            return null;
        }

        const data = await response.json();
        return data.content.download_url;
    }

    async function deleteFromGitHub(folder, fileName) {
        const filePath = `${folder}/${fileName}`;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
            method: 'DELETE',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Deleting file: ${fileName}`,
                sha: '', // Add the correct SHA here if needed
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete ${fileName}`);
        }
    }

    // Function to create delete button
    function createDeleteButton(previewGroup, fileName, folder) {
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
            try {
                await deleteFromGitHub(folder, fileName);
                previewGroup.remove();
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('Failed to delete file. Check the console for details.');
            }
        });

        return deleteButton;
    }

    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, folder = '') {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).value || 'No Title';
        const fileDescription = document.getElementById(fileDescriptionId).value || 'No Description';

        if (fileUpload.files.length > 0 || fileTitle || fileDescription) {
            const previewGroup = document.createElement('div');
            previewGroup.classList.add('preview-group');

            const previewHeader = document.createElement('div');
            previewHeader.classList.add('preview-header');

            const titleElem = document.createElement('h4');
            titleElem.innerHTML = fileTitle;
            previewHeader.appendChild(titleElem);

            const deleteButton = createDeleteButton(previewGroup, fileTitle, folder);
            previewHeader.appendChild(deleteButton);

            previewGroup.appendChild(previewHeader);

            const descriptionElem = document.createElement('p');
            descriptionElem.innerHTML = fileDescription;
            previewGroup.appendChild(descriptionElem);

            Array.from(fileUpload.files).forEach(async (file) => {
                const fileUrl = await uploadToGitHub(file, folder);
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
            });

            previewContainer.appendChild(previewGroup);
        }
    }

    // Helper Function to Read File as Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(btoa(reader.result));
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    }

    // Adding Event Listeners for Uploads
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
