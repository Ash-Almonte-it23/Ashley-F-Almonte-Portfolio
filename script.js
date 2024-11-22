// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfKdtYUZ1RfxPf5emKvQFzP-Q7_xgNzDM",
    authDomain: "ashley-f-almonte-portfolio.firebaseapp.com",
    projectId: "ashley-f-almonte-portfolio",
    storageBucket: "ashley-f-almonte-portfolio.appspot.com",
    messagingSenderId: "893010820221",
    appId: "1:893010820221:web:a2f4b3f775ad9c4c05c514",
    measurementId: "G-CPKDJ1XS7H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
    function createDeleteButton(previewGroup, docId, collectionName) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.style.display = isAdmin ? 'block' : 'none';

        deleteButton.addEventListener('click', async function () {
            if (!isAdmin) {
                alert('You are not authorized to delete items.');
                return;
            }

            try {
                await deleteDoc(doc(db, collectionName, docId));
                previewGroup.remove();
                alert('Item deleted successfully.');
            } catch (error) {
                console.error('Error deleting document: ', error);
                alert('Error deleting item. Please try again.');
            }
        });

        return deleteButton;
    }

    // File Upload Logic and Preview Loading (with Firebase integration)
    async function handleFileUpload(fileUploadId, titleId, descriptionId, previewContainer, collectionName) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const title = document.getElementById(titleId).innerText.trim();
        const description = document.getElementById(descriptionId).innerText.trim();

        if (fileUpload.files.length > 0) {
            Array.from(fileUpload.files).forEach(async file => {
                try {
                    const storageRef = ref(storage, `${collectionName}/${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    const fileUrl = await getDownloadURL(snapshot.ref);

                    await addDoc(collection(db, collectionName), {
                        title: title || 'No Title',
                        description: description || 'No Description',
                        fileUrl,
                        timestamp: new Date()
                    });

                    loadPreviewsFromFirebase(previewContainer, collectionName);
                    alert('File uploaded successfully.');
                } catch (error) {
                    console.error('Error uploading file: ', error);
                    alert('Error uploading file. Please try again.');
                }
            });
        } else if (title || description) {
            try {
                await addDoc(collection(db, collectionName), {
                    title: title || 'No Title',
                    description: description || 'No Description',
                    fileUrl: null,
                    timestamp: new Date()
                });

                loadPreviewsFromFirebase(previewContainer, collectionName);
                alert('Metadata uploaded successfully.');
            } catch (error) {
                console.error('Error uploading metadata: ', error);
                alert('Error uploading metadata. Please try again.');
            }
        }

        fileUpload.value = '';
        toggleDeleteButtons();
    }

    function loadPreviewsFromFirebase(previewContainer, collectionName) {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"));

        onSnapshot(q, snapshot => {
            previewContainer.innerHTML = '';

            snapshot.forEach(doc => {
                const data = doc.data();
                const previewGroup = document.createElement('div');
                previewGroup.classList.add('preview-group');

                const previewHeader = document.createElement('div');
                previewHeader.classList.add('preview-header');

                const titleElem = document.createElement('h4');
                titleElem.innerText = data.title || 'No Title';
                previewHeader.appendChild(titleElem);

                const deleteButton = createDeleteButton(previewGroup, doc.id, collectionName);
                previewHeader.appendChild(deleteButton);

                previewGroup.appendChild(previewHeader);

                const descriptionElem = document.createElement('p');
                descriptionElem.innerText = data.description || 'No Description';
                previewGroup.appendChild(descriptionElem);

                if (data.fileUrl) {
                    const previewItem = document.createElement('div');
                    previewItem.classList.add('preview-item');

                    if (data.fileUrl.match(/\.(jpeg|jpg|png|gif)$/)) {
                        const img = document.createElement('img');
                        img.src = data.fileUrl;
                        img.alt = data.title;
                        previewItem.appendChild(img);
                    } else if (data.fileUrl.match(/\.(mp4|webm|ogg)$/)) {
                        const video = document.createElement('video');
                        video.src = data.fileUrl;
                        video.controls = true;
                        previewItem.appendChild(video);
                    }

                    previewGroup.appendChild(previewItem);
                }

                previewContainer.appendChild(previewGroup);
            });
        });
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');

    uploadButtonProjects.addEventListener('click', () => {
        handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
    });

    uploadButtonInternships.addEventListener('click', () => {
        handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
    });

    loadPreviewsFromFirebase(uploadPreviewProjects, 'Projects');
    loadPreviewsFromFirebase(uploadPreviewInternships, 'Internships');

    toggleDeleteButtons();
});
