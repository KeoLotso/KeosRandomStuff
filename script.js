const apiUrl = 'https://api.github.com/repos/KeoLotso/KeosRandomStuff/contents';
let currentFiles = [];
let currentFolder = '';
let currentSortMode = 'A-Z';

// Map file extensions to Font Awesome icons
const fileIconMap = {
    'mp3': 'fa-file-audio',
    'wav': 'fa-file-audio',
    'fbx': 'fa-cube',
    'obj': 'fa-cube',
    'blend': 'fa-cube',
    'png': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'jpg': 'fa-file-image',
    'cs': 'fa-file-code',
    'unitypackage': 'fa-box'
};

// Folder icon map
const folderIconMap = {
    'Sounds': 'fa-music',
    '3D Models': 'fa-cube',
    'Scripts': 'fa-file-code',
    'Images': 'fa-images',
    'Unity Packages': 'fa-box'
};

async function fetchRepoContents() {
    try {
        // Show a loading message while fetching
        document.getElementById('folder-list').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading files...</p>
            </div>`;
            
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const files = await response.json();
        sortFilesIntoFolders(files);
    } catch (error) {
        console.error('Error fetching repository contents:', error);
        document.getElementById('folder-list').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading files. Please try again later.</p>
            </div>`;
    }
}

function sortFilesIntoFolders(files) {
    const soundExtensions = ['mp3', 'wav'];
    const modelExtensions = ['fbx', 'obj', 'blend'];
    const imageExtensions = ['png', 'jpeg', 'jpg'];
    const scriptExtensions = ['cs'];
    const unityPackageExtensions = ['unitypackage'];

    const sounds = [];
    const models = [];
    const scripts = [];
    const images = [];
    const unityPackages = [];

    files.forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['html', 'js', 'css'].includes(extension)) {
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

function displayFolders(sounds, models, scripts, images, unityPackages) {
    const folderList = document.getElementById('folder-list');
    folderList.innerHTML = '';

    if (sounds.length > 0) {
        createFolder(folderList, 'Sounds', sounds);
    }
    if (models.length > 0) {
        createFolder(folderList, '3D Models', models);
    }
    if (scripts.length > 0) {
        createFolder(folderList, 'Scripts', scripts);
    }
    if (images.length > 0) {
        createFolder(folderList, 'Images', images);
    }
    if (unityPackages.length > 0) {
        createFolder(folderList, 'Unity Packages', unityPackages);
    }
}

function createFolder(container, folderName, files) {
    const folder = document.createElement('div');
    folder.classList.add('folder-item');
    
    const iconClass = folderIconMap[folderName] || 'fa-folder';
    
    folder.innerHTML = `
        <div class="folder-header">
            <i class="fas ${iconClass} folder-icon"></i>
            <div class="folder-title">
                ${folderName}
                <span class="folder-count">${files.length} files</span>
            </div>
        </div>
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
    const searchContainer = document.getElementById('search-container');
    const sortOptions = document.getElementById('sort-options');

    folderList.style.display = 'none';
    fileList.style.display = 'grid';
    backButton.style.display = 'flex';
    searchContainer.style.display = 'block';
    sortOptions.style.display = 'block';

    // Update document title with folder name
    document.title = `${folderName} - Keo's Stuff Library`;
    
    // Apply current sort mode
    displayFiles(sortFiles(currentFiles));
}

function displayFiles(files) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Clear previous content

    if (files.length === 0) {
        fileList.innerHTML = `
            <div class="empty-folder">
                <i class="fas fa-folder-open"></i>
                <p>No files found</p>
            </div>
        `;
        return;
    }

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        
        const extension = file.name.split('.').pop().toLowerCase();
        const iconClass = fileIconMap[extension] || 'fa-file';
        
        let fileContent = `
            <div class="file-content">
                <div class="file-info">
                    <i class="fas ${iconClass}" style="font-size: 1.5rem; color: var(--primary-color);"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-extension">.${extension}</span>
                </div>
        `;
        
        if (['mp3', 'wav'].includes(extension)) {
            fileContent += `
                <audio controls>
                    <source src="${file.download_url}" type="audio/${extension}">
                    Your browser does not support the audio element.
                </audio>
            `;
        }
        
        fileContent += `
                <a href="${file.download_url}" download class="download-btn">
                    <i class="fas fa-download"></i>
                    Download
                </a>
            </div>
        `;
        
        fileItem.innerHTML = fileContent;
        fileList.appendChild(fileItem);
    });
}

function sortFiles(files) {
    switch (currentSortMode) {
        case 'A-Z':
            return [...files].sort((a, b) => a.name.localeCompare(b.name));
        case 'Z-A':
            return [...files].sort((a, b) => b.name.localeCompare(a.name));
        default:
            return files;
    }
}

// Initialize theme from local storage
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Toggle Theme';
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the theme
    initTheme();
    
    // Search functionality
    document.getElementById('search-bar').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredFiles = currentFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
        displayFiles(sortFiles(filteredFiles));
    });

    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        const folderList = document.getElementById('folder-list');
        const fileList = document.getElementById('file-list');
        const backButton = document.getElementById('back-button');
        const searchContainer = document.getElementById('search-container');
        const sortOptions = document.getElementById('sort-options');

        folderList.style.display = 'grid';
        fileList.style.display = 'none';
        backButton.style.display = 'none';
        searchContainer.style.display = 'none';
        sortOptions.style.display = 'none';
        
        // Reset search
        document.getElementById('search-bar').value = '';
        
        // Reset title
        document.title = "Keo's Stuff Library";
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        // Update icon and save preference
        if (document.body.classList.contains('light-mode')) {
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Toggle Theme';
            localStorage.setItem('theme', 'light');
        } else {
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i> Toggle Theme';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Sort options
    document.getElementById('sort-options').addEventListener('change', (event) => {
        currentSortMode = event.target.value;
        displayFiles(sortFiles(currentFiles));
    });

    // Start fetching repository contents
    fetchRepoContents();
});
