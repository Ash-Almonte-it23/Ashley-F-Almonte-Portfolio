document.addEventListener('DOMContentLoaded', async function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    const DROPBOX_ACCESS_TOKEN = 'sl.u.AFjENuMs1ivgJYZbFX2u4s2nPXaC_wCV7z9abGWEuCpV_F_oEweYgHkDrRkbn2n7kQFeoRCvTuFXMXd96LrmwiFWZQPSKUccS9C2zjcrmJom76chDg1nhcG-0lpTVEqQCksGL85JA8hav6habf8FHuKnID0hof-irPjtFnwKflhDso4vZFcpG6aQ7_R0bb0FbesaQYNW692yL2C1X-hQbeKubGKPM_zUzQHkd1JytNzLLg31BZXJx3L73d88_G6cAcClDHZchpkfew8HCNN4PHCSSDu8ub6WanLQJ8oHesTlSd_CexTCt79JhG5QkFRF6rfigf73eQMwAxU9QcIMcRTzN9Nupt-h4rrwppRyu-sEF853YgGcqzV-YYg5UWYkBvzwgESui7WPCqeehNkcl-R7fcstBUrcGEKQ4zPleU_tk8nHIX95IZYQTbIA2aqOEGFgtZ45ZK0qO3soGhgo00uPyMItSbsSgPCcvzWzLWSgrGtkard-VeSBT59zXg9i2wn8hvG1rFqv69Y_4gd6JpQ2PnfTsgnM20w_58BMMC0oZX7deCtq3_m5ilHEpDS0k71vP1qpMzMRJ62uuXFmekgOnA66oi2qYqlVYDCHdEo-dfR4Ku6QeEg05uCuwKI1DjaPqBhHQ_v9nKJ2O1UC-7NFASaK2y7fSLHgsMn07-ukaggP-6LwI9l-GsFKQ4w2g04iDOGoIM2Y_JVCCvOVrrzbhJ9mARPTodY6rpdi1iAjBoXHZCt0p9iOeeG9OTdkf-dLVJDM_JcWY77ZSdaiD3Komh6ocX0hxBIn5g9d-WtjYn94bgiqKR5QHC_G1f6AT6LW9rPo7lx9izBr---nB8PNRDzPJzH_-olylbNcEonDW-JJt4693FfCw9PeaL2mXqmCcQOJcK7BKqAgejQpJWfjup-WiSmC6Kwj372bc_-hXwQagFkaq3YFpIbqYjYaxgMX5i_lN41NyZvfrAeGfyFrNxDXPuhUewXM4V64gyxvHFViYujvAxHLROvr53mAXYkZN4rPVn-zs3UKy7sdJea-n9AziY27lr50zADQtQ9FlKAuGRZoSdIQEkhksU2-dMkx5QRkq-bC9sJ015ks5_OtqVclS8CmMmq8xb4yJd58ECRe0n9U4RSmNpZNJJy3eJoSiFxq7c7zLKf5MsUEx9OtIfou4IdymFKWurWJr5fq8rBnlsJRu-LBypLiIznR1m6Sy0hXQoZ2ik9xSGtcuSwduKb50pU5sY9gnRJ3FOg-BdovsbD5a89NVhjru8Afuayt-fIxsjaGiOmG-PH0p_8IpSok0ryvaDLrOQD6ohV3m-HTZnduYDrdk9Gk3yoEoEzlKlqUkTqFO1D3BcxjIcD2DTfp19QbIbn2bdti_K_VNYCKZNxYFn7_cPCXkiDMM2fvmR09cO32o0u8cPBrGSa01wUtFY-YnwPainVpJCy4BP7z0AG4UNrOHmnFz0CMHYQ
'; // Replace with your actual token

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

    // Admin Login
    document.getElementById('loginButton').addEventListener('click', function () {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === 'AAadmin' && password === '2025AAadmin') {
            alert('Login successful');
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            document.body.classList.add('admin-enabled');
            document.querySelector('.upload-container').style.display = 'block';
            toggleDeleteButtons();
        } else {
            alert('Invalid credentials.');
        }
    });

    function toggleDeleteButtons() {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.style.display = isAdmin ? 'block' : 'none';
        });
    }

    // Dropbox File Upload
    async function uploadToDropbox(file) {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: `/AshleyPortfolioUploader/${file.name}`,
                    mode: 'add',
                    autorename: true,
                    mute: false
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: file
        });
        return response.json();
    }

    async function getDropboxFileLink(filePath) {
        const response = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: filePath
            })
        });
        const data = await response.json();
        return data.url.replace('?dl=0', '?raw=1');
    }

    async function handleFileUpload(fileInputId, previewContainer, pageType) {
        if (!isAdmin) return;

        const fileInput = document.getElementById(fileInputId);
        if (fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        const uploadResponse = await uploadToDropbox(file);
        const fileUrl = await getDropboxFileLink(uploadResponse.path_lower);

        createPreview(file.name, fileUrl, previewContainer, pageType);
    }

    function createPreview(fileName, fileUrl, previewContainer, pageType) {
        const previewGroup = document.createElement('div');
        previewGroup.classList.add('preview-group');

        const previewHeader = document.createElement('div');
        previewHeader.classList.add('preview-header');

        const titleElem = document.createElement('h4');
        titleElem.textContent = fileName;
        previewHeader.appendChild(titleElem);

        if (isAdmin) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => previewGroup.remove());
            previewHeader.appendChild(deleteButton);
        }

        previewGroup.appendChild(previewHeader);

        const previewItem = document.createElement('div');
        previewItem.classList.add('preview-item');

        if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.jpeg')) {
            const img = document.createElement('img');
            img.src = fileUrl;
            img.alt = fileName;
            previewItem.appendChild(img);
        } else if (fileUrl.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = fileUrl;
            video.controls = true;
            previewItem.appendChild(video);
        }

        previewGroup.appendChild(previewItem);
        previewContainer.appendChild(previewGroup);
    }

    document.getElementById('uploadButtonInternships').addEventListener('click', function () {
        handleFileUpload('fileUploadInternships', document.getElementById('uploadPreviewInternships'), 'Internships');
    });

    document.getElementById('uploadButtonProjects').addEventListener('click', function () {
        handleFileUpload('fileUploadProjects', document.getElementById('uploadPreviewProjects'), 'Projects');
    });

    toggleDeleteButtons();
});
