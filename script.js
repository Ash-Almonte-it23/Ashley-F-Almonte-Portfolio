document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    const accessToken = "sl.u.AFjENuMs1ivgJYZbFX2u4s2nPXaC_wCV7z9abGWEuCpV_F_oEweYgHkDrRkbn2n7kQFeoRCvTuFXMXd96LrmwiFWZQPSKUccS9C2zjcrmJom76chDg1nhcG-0lpTVEqQCksGL85JA8hav6habf8FHuKnID0hof-irPjtFnwKflhDso4vZFcpG6aQ7_R0bb0FbesaQYNW692yL2C1X-hQbeKubGKPM_zUzQHkd1JytNzLLg31BZXJx3L73d88_G6cAcClDHZchpkfew8HCNN4PHCSSDu8ub6WanLQJ8oHesTlSd_CexTCt79JhG5QkFRF6rfigf73eQMwAxU9QcIMcRTzN9Nupt-h4rrwppRyu-sEF853YgGcqzV-YYg5UWYkBvzwgESui7WPCqeehNkcl-R7fcstBUrcGEKQ4zPleU_tk8nHIX95IZYQTbIA2aqOEGFgtZ45ZK0qO3soGhgo00uPyMItSbsSgPCcvzWzLWSgrGtkard-VeSBT59zXg9i2wn8hvG1rFqv69Y_4gd6JpQ2PnfTsgnM20w_58BMMC0oZX7deCtq3_m5ilHEpDS0k71vP1qpMzMRJ62uuXFmekgOnA66oi2qYqlVYDCHdEo-dfR4Ku6QeEg05uCuwKI1DjaPqBhHQ_v9nKJ2O1UC-7NFASaK2y7fSLHgsMn07-ukaggP-6LwI9l-GsFKQ4w2g04iDOGoIM2Y_JVCCvOVrrzbhJ9mARPTodY6rpdi1iAjBoXHZCt0p9iOeeG9OTdkf-dLVJDM_JcWY77ZSdaiD3Komh6ocX0hxBIn5g9d-WtjYn94bgiqKR5QHC_G1f6AT6LW9rPo7lx9izBr---nB8PNRDzPJzH_-olylbNcEonDW-JJt4693FfCw9PeaL2mXqmCcQOJcK7BKqAgejQpJWfjup-WiSmC6Kwj372bc_-hXwQagFkaq3YFpIbqYjYaxgMX5i_lN41NyZvfrAeGfyFrNxDXPuhUewXM4V64gyxvHFViYujvAxHLROvr53mAXYkZN4rPVn-zs3UKy7sdJea-n9AziY27lr50zADQtQ9FlKAuGRZoSdIQEkhksU2-dMkx5QRkq-bC9sJ015ks5_OtqVclS8CmMmq8xb4yJd58ECRe0n9U4RSmNpZNJJy3eJoSiFxq7c7zLKf5MsUEx9OtIfou4IdymFKWurWJr5fq8rBnlsJRu-LBypLiIznR1m6Sy0hXQoZ2ik9xSGtcuSwduKb50pU5sY9gnRJ3FOg-BdovsbD5a89NVhjru8Afuayt-fIxsjaGiOmG-PH0p_8IpSok0ryvaDLrOQD6ohV3m-HTZnduYDrdk9Gk3yoEoEzlKlqUkTqFO1D3BcxjIcD2DTfp19QbIbn2bdti_K_VNYCKZNxYFn7_cPCXkiDMM2fvmR09cO32o0u8cPBrGSa01wUtFY-YnwPainVpJCy4BP7z0AG4UNrOHmnFz0CMHYQ"; // Replace with your actual Dropbox token


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
                document.body.classList.add('admin-enabled')
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

     // Upload to Dropbox Function
    async function uploadToDropbox(file, folder) {
        const uploadUrl = "https://content.dropboxapi.com/2/files/upload";
        const filePath = `/${folder}/${file.name}`;

        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Dropbox-API-Arg": JSON.stringify({
                        path: filePath,
                        mode: "add",
                        autorename: true,
                        mute: false
                    }),
                    "Content-Type": "application/octet-stream"
                },
                body: file
            });

            if (!response.ok) throw new Error(await response.text());
            console.log("Upload Successful");
            return await getTemporaryLink(filePath);
        } catch (error) {
            console.error("Upload Failed:", error);
            return null;
        }
    }

    // Get Temporary File URL from Dropbox
    async function getTemporaryLink(filePath) {
        const apiUrl = "https://api.dropboxapi.com/2/files/get_temporary_link";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ path: filePath })
            });

            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            return data.link;
        } catch (error) {
            console.error("Failed to fetch file link:", error);
            return null;
        }
    }

    // Handle File Upload
    async function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, folder) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);
        const fileTitle = document.getElementById(fileTitleId).innerText.trim();
        const fileDescription = document.getElementById(fileDescriptionId).innerText.trim();
        
        if (fileUpload.files.length > 0) {
            for (let file of fileUpload.files) {
                const fileUrl = await uploadToDropbox(file, folder);
                if (fileUrl) {
                    createPreview(file.name, fileTitle, fileDescription, fileUrl, previewContainer);
                }
            }
        } else if (fileTitle || fileDescription) {
            createPreview("Text Only", fileTitle, fileDescription, null, previewContainer);
        }
    }

    // Create Preview for Uploaded Content
    function createPreview(fileName, title, description, fileUrl, previewContainer) {
        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const titleElem = document.createElement('h4');
        titleElem.textContent = title || 'No Title';
        previewGroup.appendChild(titleElem);

        const descriptionElem = document.createElement('p');
        descriptionElem.textContent = description || 'No Description';
        previewGroup.appendChild(descriptionElem);

        if (fileUrl) {
            if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.jpeg')) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.alt = fileName;
                previewGroup.appendChild(img);
            } else if (fileUrl.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                previewGroup.appendChild(video);
            }
        }

        previewContainer.appendChild(previewGroup);
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
    

    // File Upload Logic and Preview Loading (with text-only upload support)
    function handleFileUpload(fileUploadId, fileTitleId, fileDescriptionId, previewContainer, pageType) {
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
            // Handle case for title and description without files
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

    // Save and Load from Local Storage
    function saveToLocalStorage(fileName, title, description, fileUrl, pageType) {
        let previews = JSON.parse(localStorage.getItem(`${pageType}_previews`)) || [];
        previews.push({ fileName, title, description, fileUrl });
        localStorage.setItem(`${pageType}_previews`, JSON.stringify(previews));
    }

    function loadPreviewsFromStorage(previewContainer, pageType) {
        const previews = JSON.parse(localStorage.getItem(`${pageType}_previews`)) || [];
        previews.forEach(({ fileName, title, description, fileUrl }) => {
            createPreview(fileName, title, description, fileUrl, previewContainer, pageType);
        });
        toggleDeleteButtons();
    }

    function createPreview(fileName, title, description, fileUrl, previewContainer, pageType) {
        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const previewHeader = document.createElement('div');
        previewHeader.classList.add('preview-header');

        const titleElem = document.createElement('h4');
        titleElem.innerHTML = title || 'No Title';
        previewHeader.appendChild(titleElem);

        const deleteButton = createDeleteButton(previewGroup, fileName, pageType);
        previewHeader.appendChild(deleteButton);

        previewGroup.appendChild(previewHeader);

        const descriptionElem = document.createElement('p');
        descriptionElem.innerHTML = description || 'No Description';
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

    function removeFromLocalStorage(fileName, pageType) {
        let previews = JSON.parse(localStorage.getItem(`${pageType}_previews`)) || [];
        previews = previews.filter(preview => preview.fileName !== fileName);
        localStorage.setItem(`${pageType}_previews`, JSON.stringify(previews));
    }

    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    if (uploadButtonInternships) {
        uploadButtonInternships.addEventListener('click', function () {
            handleFileUpload('fileUploadInternships', 'fileTitleInternships', 'fileDescriptionInternships', uploadPreviewInternships, 'Internships');
        });
        loadPreviewsFromStorage(uploadPreviewInternships, 'Internships');
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', function () {
            handleFileUpload('fileUploadProjects', 'fileTitleProjects', 'fileDescriptionProjects', uploadPreviewProjects, 'Projects');
        });
        loadPreviewsFromStorage(uploadPreviewProjects, 'Projects');
    }

    // Initialize admin features on page load
    toggleAdminFeatures();
});
