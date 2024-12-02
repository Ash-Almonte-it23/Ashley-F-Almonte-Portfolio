document.addEventListener('DOMContentLoaded', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    const GITHUB_API_URL = "https://api.github.com";
    const githubToken = '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'; // Replace with your GitHub token
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
     const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // GitHub API configuration
    const repoName = 'Ashley-F-Almonte-Portfolio';
    const owner = 'ash-almonte-it23';
    const token = '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'; // Replace this with your GitHub token
    // Loading Screen Logic
    window.addEventListener('load', function () {
        if (loadingScreen) {
@@ -60,6 +59,7 @@ document.addEventListener('DOMContentLoaded', function () {
                isAdmin = true;
                localStorage.setItem('isAdmin', 'true');
                document.body.classList.add('admin-enabled');
                document.querySelector('.upload-container').style.display = 'block';
                toggleDeleteButtons();
                usernameField.value = '';
                passwordField.value = '';
@@ -99,73 +99,12 @@ document.addEventListener('DOMContentLoaded', function () {
                return;
            }
            previewGroup.remove();
            removeFromGitHub(fileName, pageType);
            removeFromLocalStorage(fileName, pageType);
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
@@ -198,34 +137,116 @@ document.addEventListener('DOMContentLoaded', function () {
        toolbar.querySelector('input[type="color"]').addEventListener('input', (event) => {
            document.execCommand('foreColor', false, event.target.value);
        });
        toolbar.querySelector('button[title="Increase Font Size"]').addEventListener('click', () => {
            document.execCommand('fontSize', false, '4');
        });
        toolbar.querySelector('button[title="Decrease Font Size"]').addEventListener('click', () => {
            document.execCommand('fontSize', false, '2');
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

    // File Upload Logic and Preview Loading
    function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
    // File Upload Logic
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
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
            const deleteButton = createDeleteButton(previewGroup, fileTitle, pageType);
            previewHeader.appendChild(deleteButton);
            previewGroup.appendChild(previewHeader);
            const descriptionElem = document.createElement('p');
            descriptionElem.innerHTML = fileDescription;
            previewGroup.appendChild(descriptionElem);
            Array.from(fileUpload.files).forEach(async (file) => {
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
            });
        } else if (fileTitle || fileDescription) {
            const metadata = JSON.stringify({ title: fileTitle, description: fileDescription });
            uploadToGitHub('metadata.json', metadata, pageType);
            previewContainer.appendChild(previewGroup);
        }
    }
    async function uploadToGitHub(file, title, description) {
        const formData = new FormData();
        formData.append('message', `Upload ${title}`);
        formData.append('content', file);
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.name}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Adding file: ${file.name}`,
                content: btoa(file),
            })
        });
        const data = await response.json();
        return data.content.download_url;
    }
    // Load previews from localStorage
    function loadPreviewsFromStorage(previewContainer, pageType) {
        // Similar logic for GitHub to fetch metadata
    }
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
