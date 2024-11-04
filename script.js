// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfKdtYUZ1RfxPf5emKvQFzP-Q7_xgNzDM",
  authDomain: "ashley-f-almonte-portfolio.firebaseapp.com",
  projectId: "ashley-f-almonte-portfolio",
  storageBucket: "ashley-f-almonte-portfolio.firebasestorage.app",
  messagingSenderId: "893010820221",
  appId: "1:893010820221:web:a2f4b3f775ad9c4c05c514",
  measurementId: "G-CPKDJ1XS7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
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
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = 'light-mode';
        localStorage.setItem('theme', 'light-mode');
    }
    body.classList.add(currentTheme);
    darkModeToggle.checked = (currentTheme === 'dark-mode');

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
            button.style.display = isAdmin ? 'block' : 'none';
        });
    }

    // Function to create delete button for each preview group
    function createDeleteButton(previewGroup, docId) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.style.display = isAdmin ? 'block' : 'none';

        deleteButton.addEventListener('click', async function () {
            if (!isAdmin) {
                alert('You are not authorized to delete items.');
                return;
            }
            await deleteDoc(doc(db, "previews", docId));
            previewGroup.remove();
        });
        return deleteButton;
    }

    // Save a preview to Firebase
    async function saveToFirebase(title, description, fileUrl) {
        await addDoc(collection(db, "previews"), {
            title,
            description,
            fileUrl,
            timestamp: new Date(),
        });
    }

    // Load all previews from Firebase
    function loadPreviewsFromFirebase(previewContainer) {
        const previewsQuery = query(collection(db, "previews"), orderBy("timestamp", "asc"));
        onSnapshot(previewsQuery, (snapshot) => {
            previewContainer.innerHTML = ""; 
            snapshot.forEach((doc) => {
                const data = doc.data();
                const previewGroup = createPreview(null, data.title, data.description, data.fileUrl, previewContainer);
                const deleteButton = createDeleteButton(previewGroup, doc.id);
                previewGroup.appendChild(deleteButton);
            });
        });
    }

    // Set up upload and preview loading for each section
    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    uploadButtonInternships.addEventListener('click', function () {
        handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships);
    });
    loadPreviewsFromFirebase(uploadPreviewInternships);

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    uploadButtonProjects.addEventListener('click', function () {
        handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects);
    });
    loadPreviewsFromFirebase(uploadPreviewProjects);

    // Handles file uploads and stores them in Firebase
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer) {
        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerHTML;
        const fileDescription = document.getElementById(fileDescriptionId).innerHTML;

        if (fileUpload.files.length > 0) {
            Array.from(fileUpload.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = async function (e) {
                    const fileUrl = e.target.result;
                    await saveToFirebase(fileTitle, fileDescription, fileUrl);
                    loadPreviewsFromFirebase(previewContainer);
                };
                reader.readAsDataURL(file);
            });
        } else if (fileTitle || fileDescription) {
            await saveToFirebase(fileTitle, fileDescription, null);
            loadPreviewsFromFirebase(previewContainer);
        }
    }

    // Create a preview element for a file or text entry
    function createPreview(fileName, title, description, fileUrl, previewContainer) {
        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const previewHeader = document.createElement('div');
        previewHeader.classList.add('preview-header');

        const titleElem = document.createElement('h4');
        titleElem.innerHTML = title || 'No Title';
        previewHeader.appendChild(titleElem);

        const descriptionElem = document.createElement('p');
        descriptionElem.innerHTML = description || 'No Description';
        previewGroup.appendChild(previewHeader);
        previewGroup.appendChild(descriptionElem);

        if (fileUrl) {
            const previewItem = document.createElement('div');
            previewItem.classList.add('preview-item');
            if (fileUrl.startsWith('data:image')) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.alt = fileName;
                previewItem.appendChild(img);
            } else if (fileUrl.startsWith('data:video')) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                previewItem.appendChild(video);
            }
            previewGroup.appendChild(previewItem);
        }

        previewContainer.appendChild(previewGroup);
    }

    // Popup toolbar for text formatting in the description and title fields
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

        toolbar.querySelector('button[title="Increase Font Size"]').addEventListener('click', () => {
            document.execCommand('fontSize', false, '4');
            toolbar.style.display = 'none';
        });
        toolbar.querySelector('button[title="Decrease Font Size"]').addEventListener('click', () => {
            document.execCommand('fontSize', false, '2');
            toolbar.style.display = 'none';
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
});