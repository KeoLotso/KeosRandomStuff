const apiUrl = 'https://api.github.com/repos/KeoLotso/KeosRandomStuff/contents'; 
let currentFiles = [];
let currentFolder = '';
let currentSortMode = 'A-Z';
let isDarkMode = true;

async function fetchRepoContents() {
    showLoading(true);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json();
        sortFilesIntoFolders(files);
        showLoading(false);
    } catch (error) {
        console.error('Error fetching repository contents:', error);
        showError('Failed to load content. Please try again later.');
        showLoading(false);
    }
}

function showLoading(isLoading) {
    const folderList = document.getElementById('folder-list');
    
    if (isLoading) {
        folderList.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    }
}

function showError(message) {
    const folderList = document.getElementById('folder-list');
    folderList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function sortFilesIntoFolders(files) {
    const soundExtensions = ['mp3', 'wav', 'ogg'];
    const modelExtensions = ['fbx', 'obj', 'blend', 'gltf', 'glb'];
    const imageExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
    const scriptExtensions = ['cs', 'js', 'py', 'c', 'cpp'];
    const unityPackageExtensions = ['unitypackage'];

    const sounds = [];
    const models = [];
    const scripts = [];
    const images = [];
    const unityPackages = [];

    files.forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        // Add file size info
        file.sizeFormatted = formatFileSize(file.size);
        
        if (!['html', 'md', 'gitignore'].includes(extension)) {
            if (soundExtensions.includes(extension)) {
                sounds.push(file);
            } else if (modelExtensions.includes(extension)) {
                models.push(file);
            } else if (imageExtensions.includes(extension)) {
                images.push(file);
            } else if (scriptExtensions.includes(extension)) {
                scripts.push(file);
            } else if (unityPackageExtensions.includes(extension)) {
                unityPackages.push(file);
            }
        }
    });

    displayFolders(sounds, models, scripts, images, unityPackages);
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function displayFolders(sounds, models, scripts, images, unityPackages) {
    const folderList = document.getElementById('folder-list');
    folderList.innerHTML = '';

    if (sounds.length > 0) {
        createFolder(folderList, 'Sounds', sounds, 'fas fa-music');
    }
    if (models.length > 0) {
        createFolder(folderList, '3D Models', models, 'fas fa-cube');
    }
    if (scripts.length > 0) {
        createFolder(folderList, 'Scripts', scripts, 'fas fa-code');
    }
    if (images.length > 0) {
        createFolder(folderList, 'Images', images, 'fas fa-image');
    }
    if (unityPackages.length > 0) {
        createFolder(folderList, 'Unity Packages', unityPackages, 'fas fa-box');
    }

    // Show empty state if no folders
    if (folderList.children.length === 0) {
        folderList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No files found</p>
            </div>
        `;
    }
}

function createFolder(container, folderName, files, iconClass) {
    const folder = document.createElement('div');
    folder.classList.add('folder-item');
    folder.innerHTML = `
        <div class="folder-content">
            <i class="${iconClass} fa-2x" style="margin-right: 16px; color: var(--accent-primary)"></i>
            <div class="folder-details">
                <span class="folder-name">${folderName}</span>
                <span class="folder-count">${files.length} file${files.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-secondary)"></i>
    `;
    folder.addEventListener('click', () => openFolder(folderName, files));
    container.appendChild(folder);
}

function openFolder(folderName, files) {
    currentFolder = folderName;
    currentFiles = files;

    const folderList = document.getElementById('folder-list');
    const fileList = document.getElementById('file-list');
    const backButton = document.getElementById('back-button');
    const searchBar = document.getElementById('search-bar');
    const sortOptions = document.getElementById('sort-options');

    folderList.style.display = 'none';
    fileList.style.display = 'grid';
    backButton.style.display = 'flex';
    searchBar.style.display = 'block';
    sortOptions.style.display = 'block';

    displayFiles(currentFiles);
}

function displayFiles(files) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = `<h2>${currentFolder}</h2>`;

    files = sortFiles(files);

    if (files.length === 0) {
        fileList.innerHTML += `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No files match your search</p>
            </div>
        `;
        return;
    }

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        const extension = file.name.split('.').pop().toLowerCase();
        const fileIcon = getFileIcon(extension);

        if (['mp3', 'wav', 'ogg'].includes(extension)) {
            fileItem.innerHTML = `
                <div class="file-content">
                    <div class="file-info">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="${fileIcon}" style="margin-right: 10px; color: var(--accent-primary)"></i>
                            <span class="file-name">${file.name}</span>
                        </div>
                        <span class="file-size">${file.sizeFormatted}</span>
                        <audio controls>
                            <source src="${file.download_url}" type="audio/${extension}">
                        </audio>
                    </div>
                    <a href="${file.download_url}" download class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            `;
        } else {
            fileItem.innerHTML = `
                <div class="file-content">
                    <div class="file-info">
                        <div style="display: flex; align-items: center;">
                            <i class="${fileIcon}" style="margin-right: 10px; color: var(--accent-primary)"></i>
                            <span class="file-name">${file.name}</span>
                        </div>
                        <span class="file-size">${file.sizeFormatted}</span>
                    </div>
                    <a href="${file.download_url}" download class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            `;
        }

        fileList.appendChild(fileItem);
    });
}

function getFileIcon(extension) {
    const iconMap = {
        // Audio
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'ogg': 'fas fa-file-audio',
        // 3D Models
        'fbx': 'fas fa-cube',
        'obj': 'fas fa-cube',
        'blend': 'fas fa-cube',
        'gltf': 'fas fa-cube',
        'glb': 'fas fa-cube',
        // Images
        'png': 'fas fa-file-image',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'webp': 'fas fa-file-image',
        // Scripts
        'cs': 'fas fa-file-code',
        'js': 'fas fa-file-code',
        'py': 'fas fa-file-code',
        'c': 'fas fa-file-code',
        'cpp': 'fas fa-file-code',
        // Unity
        'unitypackage': 'fas fa-box'
    };
    
    return iconMap[extension] || 'fas fa-file';
}

function sortFiles(files) {
    switch (currentSortMode) {
        case 'A-Z':
            return files.sort((a, b) => a.name.localeCompare(b.name));
        case 'Z-A':
            return files.sort((a, b) => b.name.localeCompare(a.name));
        case 'Newest':
            return files.sort((a, b) => new Date(b.sha) - new Date(a.sha));
        case 'Oldest':
            return files.sort((a, b) => new Date(a.sha) - new Date(b.sha));
        default:
            return files;
    }
}

// Event Listeners
document.getElementById('search-bar').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredFiles = currentFiles.filter(file => file.name.toLowerCase().includes(searchTerm));
    displayFiles(filteredFiles);
});

document.getElementById('sort-options').addEventListener('change', (event) => {
    currentSortMode = event.target.value;
    displayFiles(currentFiles);
});

document.getElementById('back-button').addEventListener('click', () => {
    const folderList = document.getElementById('folder-list');
    const fileList = document.getElementById('file-list');
    const backButton = document.getElementById('back-button');
    const searchBar = document.getElementById('search-bar');
    const sortOptions = document.getElementById('sort-options');

    folderList.style.display = 'grid';
    fileList.style.display = 'none';
    backButton.style.display = 'none';
    searchBar.style.display = 'none';
    sortOptions.style.display = 'none';
    
    // Clear search
    document.getElementById('search-bar').value = '';
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    isDarkMode = !isDarkMode;
    
    const themeIcon = document.querySelector('#theme-toggle i');
    const themeText = document.querySelector('#theme-toggle .toggle-text');
    
    if (isDarkMode) {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    } else {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    }
});

// Initialize
fetchRepoContents();
