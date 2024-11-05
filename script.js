// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";  // Added auth functions


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
const auth = getAuth(app);  // Initialize Firebase Auth

document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = false;  // Track admin status

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

    // Admin Login Functionality with Firebase Authentication
    const loginButton = document.getElementById('loginButton');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    if (loginButton) {
        loginButton.addEventListener('click', async function () {
            const email = usernameField.value.trim();
            const password = passwordField.value.trim();

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                isAdmin = true;
                localStorage.setItem('isAdmin', 'true');
                document.body.classList.add('admin-enabled');
                toggleDeleteButtons();
                alert('Login successful');
                usernameField.value = '';
                passwordField.value = '';
                document.getElementById('adminLogin').style.display = 'none';
            } catch (error) {
                console.error("Authentication failed:", error.message);
                alert('Invalid credentials. Please try again.');
            }
        });
    }

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

    setupPopupToolbar('fileTitleInternships', 'popupToolbarTitleInternships');
    setupPopupToolbar('fileDescriptionInternships', 'popupToolbarDescriptionInternships');
    setupPopupToolbar('fileTitleProjects', 'popupToolbarTitleProjects');
    setupPopupToolbar('fileDescriptionProjects', 'popupToolbarDescriptionProjects');
});
