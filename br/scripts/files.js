const SERVER_URL = '';
let currentPath = '';

async function loadFiles(path = '') {
  currentPath = path;
  const listElement = document.getElementById('file-list');
  
  try {
    // Added headers option to bypass Localtunnel's reminder/interstitial page
    const response = await fetch(`${SERVER_URL}/list-files?path=${encodeURIComponent(path)}`, {
      headers: {
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    const data = await response.json();

    if (data.error) {
      listElement.innerHTML = `<tr><td colspan="3" style="color:red; padding:10px 8px;">Error: ${data.error}</td></tr>`;
      return;
    }

    listElement.innerHTML = '';

    // If we are inside a subfolder, show a "Go Back" button
    if (currentPath !== '') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')).replace(/\/$/, '');
      const backRow = document.createElement('tr');
      backRow.innerHTML = `<td colspan="3" style="padding:10px 8px">📁 <a href="#" onclick="loadFiles('${parentPath}'); return false;">.. (Voltar)</a></td>`;
      listElement.appendChild(backRow);
    }

    // Render Folders
    data.folders.forEach(folder => {
      const folderPath = currentPath ? `${currentPath}/${folder}` : folder;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding:10px 8px">📁 <a href="#" onclick="loadFiles('${folderPath}'); return false;"><strong>${folder}/</strong></a></td>
        <td style="padding:10px 8px"></td>
        <td style="padding:10px 8px"></td>
      `;
      listElement.appendChild(row);
    });

    // Render Files
    data.files.forEach(file => {
      const filename = typeof file === 'string' ? file : (file.name ?? file.filename ?? file.path ?? '');
      const filePath = currentPath ? `${currentPath}/${filename}` : filename;
      const size = typeof file === 'string' ? '' : (file.size ?? file.fileSize ?? file.sizeInBytes ?? '');
      const date = typeof file === 'string' ? '' : (file.date ?? file.modified ?? file.mtime ?? '');

      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding:10px 8px">📄 <a href="${SERVER_URL}/download/${encodeURI(filePath)}" target="_blank">${filename}</a></td>
        <td style="padding:10px 8px">${size}</td>
        <td style="padding:10px 8px">${date}</td>
      `;
      listElement.appendChild(row);
    });

    if (data.folders.length === 0 && data.files.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="3" style="padding:18px 8px;opacity:0.8">Essa pasta está vazia.</td>';
      listElement.appendChild(emptyRow);
    }

  } catch (error) {
    console.error('Error fetching directory content:', error);
    listElement.innerHTML = '<tr><td colspan="3" style="color:red; padding:10px 8px;">Erro à carregar arquivos. Talvez o servidor não esteja funcionando?</td></tr>';
  }
}

// Initial load for root directory
loadFiles();