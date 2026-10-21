/**
 * File Attachment Utility for Task and Assignment System
 * Supports uploading, previewing, and downloading any file type (.pdf, .docx, .zip, .py, .xlsx, images, etc.)
 */

export const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return '';
  if (typeof bytes === 'string' && (bytes.includes('KB') || bytes.includes('MB') || bytes.includes('B'))) {
    return bytes;
  }
  const num = Number(bytes);
  if (isNaN(num)) return String(bytes);
  if (num < 1024) return `${num} B`;
  const kb = num / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export const readFileAsAttachment = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Limit single file size for in-memory / localStorage safety (15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return reject(new Error(`File "${file.name}" is too large (${formatFileSize(file.size)}). Max allowed size is 15MB.`));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        rawSize: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: e.target?.result,
        lastModified: file.lastModified,
      });
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file "${file.name}"`));
    };

    reader.readAsDataURL(file);
  });
};

export const downloadAttachment = (att) => {
  if (!att) return;

  const fileName = att.name || 'downloaded-file';

  if (att.dataUrl) {
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (att.link) {
    window.open(att.link, '_blank');
    return;
  }

  // Fallback: create mock content text file for demonstration if dataUrl wasn't saved
  const mockContent = `[Attachment: ${fileName}]\nFile Type: ${att.type || 'Document'}\nSize: ${att.size || 'Unknown'}\nDownloaded from Indira College Task Portal.`;
  const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getFileExtension = (filename = '') => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const getFileBadgeColor = (filename = '') => {
  const ext = getFileExtension(filename);
  switch (ext) {
    case 'pdf':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    case 'py':
    case 'cpp':
    case 'c':
    case 'java':
    case 'js':
    case 'jsx':
    case 'ts':
    case 'html':
    case 'css':
    case 'sql':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
    case '7z':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'xlsx':
    case 'xls':
    case 'csv':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    case 'pptx':
    case 'ppt':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'svg':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    default:
      return 'bg-slate-700/50 text-slate-300 border-slate-600';
  }
};
