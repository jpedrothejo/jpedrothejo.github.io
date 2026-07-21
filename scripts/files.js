const SERVER_URL = 'http://192.168.1.122:5000';
let currentPath = '';

async function loadFiles(path = '') {
  currentPath = path;
  const listElement = document.getElementById('file-list');
  
  try {
    const response = await fetch(`${SERVER_URL}/list-files?path=${encodeURIComponent(path)}`);
    const data = await response.json();

    if (data.error) {
      listElement.innerHTML = `<li style="color:red;">Error: ${data.error}</li>`;
      return;
    }

    listElement.innerHTML = '';

    // If we are inside a subfolder, show a "Go Back" button
    if (currentPath !== '') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')).replace(/\/$/, '');
      const backLi = document.createElement('li');
      backLi.innerHTML = `<a href="#" onclick="loadFiles('${parentPath}'); return false;">📁 .. (Go Back)</a>`;
      listElement.appendChild(backLi);
    }

    // Render Folders (Clicking updates the view to that folder)
    data.folders.forEach(folder => {
      const folderPath = currentPath ? `${currentPath}/${folder}` : folder;
      const li = document.createElement('li');
      li.innerHTML = `📁 <a href="#" onclick="loadFiles('${folderPath}'); return false;"><strong>${folder}/</strong></a>`;
      listElement.appendChild(li);
    });

    // Render Files (Clicking triggers file download)
    data.files.forEach(filename => {
      const filePath = currentPath ? `${currentPath}/${filename}` : filename;
      const li = document.createElement('li');
      li.innerHTML = `📄 <a href="${SERVER_URL}/download/${encodeURI(filePath)}">${filename}</a>`;
      listElement.appendChild(li);
    });

    if (data.folders.length === 0 && data.files.length === 0) {
      listElement.innerHTML += '<li>This folder is empty.</li>';
    }

  } catch (error) {
    console.error('Error fetching directory content:', error);
    listElement.innerHTML = '<li style="color:red;">Failed to connect to the file server. Maybe it\'s down?</li>';
  }
}

// Initial load for root directory
loadFiles();