document.addEventListener('DOMContentLoaded', function () {
    // ✅ Secure Dropbox API Token (Move to backend for better security)
    const accessToken = "sl.u.AFjENuMs1ivgJYZbFX2u4s2nPXaC_wCV7z9abGWEuCpV_F_oEweYgHkDrRkbn2n7kQFeoRCvTuFXMXd96LrmwiFWZQPSKUccS9C2zjcrmJom76chDg1nhcG-0lpTVEqQCksGL85JA8hav6habf8FHuKnID0hof-irPjtFnwKflhDso4vZFcpG6aQ7_R0bb0FbesaQYNW692yL2C1X-hQbeKubGKPM_zUzQHkd1JytNzLLg31BZXJx3L73d88_G6cAcClDHZchpkfew8HCNN4PHCSSDu8ub6WanLQJ8oHesTlSd_CexTCt79JhG5QkFRF6rfigf73eQMwAxU9QcIMcRTzN9Nupt-h4rrwppRyu-sEF853YgGcqzV-YYg5UWYkBvzwgESui7WPCqeehNkcl-R7fcstBUrcGEKQ4zPleU_tk8nHIX95IZYQTbIA2aqOEGFgtZ45ZK0qO3soGhgo00uPyMItSbsSgPCcvzWzLWSgrGtkard-VeSBT59zXg9i2wn8hvG1rFqv69Y_4gd6JpQ2PnfTsgnM20w_58BMMC0oZX7deCtq3_m5ilHEpDS0k71vP1qpMzMRJ62uuXFmekgOnA66oi2qYqlVYDCHdEo-dfR4Ku6QeEg05uCuwKI1DjaPqBhHQ_v9nKJ2O1UC-7NFASaK2y7fSLHgsMn07-ukaggP-6LwI9l-GsFKQ4w2g04iDOGoIM2Y_JVCCvOVrrzbhJ9mARPTodY6rpdi1iAjBoXHZCt0p9iOeeG9OTdkf-dLVJDM_JcWY77ZSdaiD3Komh6ocX0hxBIn5g9d-WtjYn94bgiqKR5QHC_G1f6AT6LW9rPo7lx9izBr---nB8PNRDzPJzH_-olylbNcEonDW-JJt4693FfCw9PeaL2mXqmCcQOJcK7BKqAgejQpJWfjup-WiSmC6Kwj372bc_-hXwQagFkaq3YFpIbqYjYaxgMX5i_lN41NyZvfrAeGfyFrNxDXPuhUewXM4V64gyxvHFViYujvAxHLROvr53mAXYkZN4rPVn-zs3UKy7sdJea-n9AziY27lr50zADQtQ9FlKAuGRZoSdIQEkhksU2-dMkx5QRkq-bC9sJ015ks5_OtqVclS8CmMmq8xb4yJd58ECRe0n9U4RSmNpZNJJy3eJoSiFxq7c7zLKf5MsUEx9OtIfou4IdymFKWurWJr5fq8rBnlsJRu-LBypLiIznR1m6Sy0hXQoZ2ik9xSGtcuSwduKb50pU5sY9gnRJ3FOg-BdovsbD5a89NVhjru8Afuayt-fIxsjaGiOmG-PH0p_8IpSok0ryvaDLrOQD6ohV3m-HTZnduYDrdk9Gk3yoEoEzlKlqUkTqFO1D3BcxjIcD2DTfp19QbIbn2bdti_K_VNYCKZNxYFn7_cPCXkiDMM2fvmR09cO32o0u8cPBrGSa01wUtFY-YnwPainVpJCy4BP7z0AG4UNrOHmnFz0CMHYQ";

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    // 🟢 Loading Screen Logic
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

    // 🟢 Dark Mode Toggle Logic
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

    // 🟢 Admin Login Functionality
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
                toggleAdminFeatures();
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // 🟢 Function to Upload Files to Dropbox
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

    // 🟢 Function to Get Temporary File URL from Dropbox
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

    // 🟢 Function to Load Previews from Dropbox
    async function loadPreviewsFromDropbox(previewContainer, folder) {
        const apiUrl = "https://api.dropboxapi.com/2/files/list_folder";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ path: `/${folder}` })
            });

            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
            previewContainer.innerHTML = '';

            for (let file of data.entries) {
                const fileUrl = await getTemporaryLink(file.path_lower);
                if (fileUrl) {
                    createPreview(file.name, "Stored Title", "Stored Description", fileUrl, previewContainer);
                }
            }
        } catch (error) {
            console.error("Failed to load previews:", error);
        }
    }

    // 🟢 Function to Handle File Upload
    async function handleFileUpload(fileUploadId, previewContainer, folder) {
        if (!isAdmin) return;

        const fileUpload = document.getElementById(fileUploadId);

        for (let file of fileUpload.files) {
            const fileUrl = await uploadToDropbox(file, folder);
            if (fileUrl) {
                alert("File uploaded successfully!");
                loadPreviewsFromDropbox(previewContainer, folder);
            }
        }
    }

    // 🟢 Function to Setup Popup Toolbar
    function setupPopupToolbar(containerId, toolbarId) {
        const container = document.getElementById(containerId);
        const toolbar = document.getElementById(toolbarId);

        if (!container || !toolbar) return;

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
                document.execCommand(button.dataset.command, false, null);
                toolbar.style.display = 'none';
            });
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

    // 🟢 Setup File Upload Buttons
    const uploadButtonInternships = document.getElementById('uploadButtonInternships');
    const uploadPreviewInternships = document.getElementById('uploadPreviewInternships');
    if (uploadButtonInternships) {
        uploadButtonInternships.addEventListener('click', function () {
            handleFileUpload('fileUploadInternships', uploadPreviewInternships, 'Internships');
        });
        loadPreviewsFromDropbox(uploadPreviewInternships, 'Internships');
    }

    const uploadButtonProjects = document.getElementById('uploadButtonProjects');
    const uploadPreviewProjects = document.getElementById('uploadPreviewProjects');
    if (uploadButtonProjects) {
        uploadButtonProjects.addEventListener('click', function () {
            handleFileUpload('fileUploadProjects', uploadPreviewProjects, 'Projects');
        });
        loadPreviewsFromDropbox(uploadPreviewProjects, 'Projects');
    }
});
