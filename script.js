document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    const GITHUB_API_URL = "https://api.github.com";
    const githubToken = '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'; // Replace with your GitHub token
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';

    // Helper function for GitHub API requests
    async function githubApiRequest(endpoint, method = "GET", body = null) {
        const headers = {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3+json",
        };

        const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
            console.error("GitHub API error:", response.statusText);
            return null;
        }
        return response.json();
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
                button.classList.remove('disabled');
            } else {
                button.style.display = 'none';
                button.disabled = true;
                button.classList.add('disabled');
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

    // File Upload Logic with GitHub API Integration
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerHTML;
        const fileDescription = document.getElementById(fileDescriptionId).innerHTML;

        if (fileUpload.files.length > 0) {
            const file = fileUpload.files[0];
            const reader = new FileReader();

            reader.onload = async function (e) {
                const base64File = e.target.result.split(",")[1]; // Extract Base64 content

                const uploadResponse = await githubApiRequest(
                    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${pageType}/${file.name}`,
                    "PUT",
                    {
                        message: `Uploaded ${file.name}`,
                        content: base64File,
                    }
                );

                if (uploadResponse) {
                    const fileUrl = uploadResponse.content.download_url;

                    const metadata = {
                        title: fileTitle,
                        description: fileDescription,
                        fileUrl,
                    };

                    await githubApiRequest(
                        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${pageType}/metadata.json`,
                        "PUT",
                        {
                            message: "Updated metadata",
                            content: btoa(JSON.stringify(metadata)),
                        }
                    );

                    alert('File uploaded and metadata updated successfully.');
                    loadPreviewsFromGithub(previewContainer, pageType);
                }
            };

            reader.readAsDataURL(file);
        } else if (fileTitle || fileDescription) {
            alert("Please enter a title or description.");
        }
    }

    async function loadPreviewsFromGithub(previewContainer, pageType) {
        const metadataResponse = await githubApiRequest(
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${pageType}/metadata.json`
        );

        if (metadataResponse) {
            const metadata = JSON.parse(atob(metadataResponse.content));
            const previewGroup = document.createElement('div');
            previewGroup.innerHTML = `
                <h4>${metadata.title}</h4>
                <p>${metadata.description}</p>
                <a href="${metadata.fileUrl}" target="_blank">View File</a>
            `;
            previewContainer.appendChild(previewGroup);
        }
    }

    // Initialize Previews
    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    if (uploadButtonInternships) {
        uploadButtonInternships.addEventListener('click', function () {
            handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
        });
        loadPreviewsFromGithub(uploadPreviewInternships, 'Internships');
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', function () {
            handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
        });
        loadPreviewsFromGithub(uploadPreviewProjects, 'Projects');
    }

    toggleDeleteButtons();
});
