'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface Folder {
  id: number;
  nama: string;
  modul: string;
  parent_id: number | null;
}

interface FileItem {
  id: number;
  original_name: string;
  path: string;
  mime_type: string;
  size_kb: number;
}

interface FolderExplorerProps {
  modul: string;
  canManage?: boolean;
}

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'];
const MAX_SIZE_MB = 69;

export default function FolderExplorer({ modul, canManage = false }: FolderExplorerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: number; type: 'folder' | 'file'; name: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContent = async (parentId: number | null, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsFetching(true);
    
    try {
      const parentQuery = parentId ? `parent_id=${parentId}` : 'parent_id=null';
      const res = await fetch(`/api/folder?modul=${modul}&${parentQuery}`);
      const data = await res.json();
      if (data.data) {
        setFolders(data.data);
        setFiles(data.files || []);
      }
    } catch (err) {
      setError('Gagal memuat konten folder.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchContent(currentFolder ? currentFolder.id : null, true);
  }, [currentFolder, modul]);

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: newFolderName,
          modul,
          parent_id: currentFolder ? currentFolder.id : null,
        }),
      });
      if (res.ok) {
        setNewFolderName('');
        setShowAddFolder(false);
        fetchContent(currentFolder ? currentFolder.id : null);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Gagal membuat folder');
      }
    } catch (err) {
      alert('Gagal membuat folder');
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Hapus folder ini? Semua isi mungkin tidak bisa diakses.')) return;
    try {
      const res = await fetch(`/api/folder/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContent(currentFolder ? currentFolder.id : null);
      }
    } catch (err) {
      alert('Gagal menghapus folder');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('modul', modul);
    if (currentFolder) {
      formData.append('folder_id', String(currentFolder.id));
    }

    try {
      const res = await fetch('/api/file', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchContent(currentFolder ? currentFolder.id : null);
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal mengupload file');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat upload.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm('Hapus file ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/file/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContent(currentFolder ? currentFolder.id : null);
      } else {
        alert('Gagal menghapus file');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus file.');
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    try {
      const endpoint = editingItem.type === 'folder' 
        ? `/api/folder/${editingItem.id}` 
        : `/api/file/${editingItem.id}/rename`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: editingItem.name }),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchContent(currentFolder ? currentFolder.id : null);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Gagal mengubah nama');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengubah nama.');
    }
  };

  const handleViewFile = (file: FileItem) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bankdata-storage/${file.path}`;
    const ext = file.original_name.split('.').pop()?.toLowerCase();
    
    const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
    
    if (isOffice) {
      window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bankdata-storage/${file.path}?download=${encodeURIComponent(file.original_name)}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.original_name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return (
      <svg className="w-12 h-12 text-blue-400 mb-1.5 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    );
    if (mime.includes('pdf')) return (
      <svg className="w-12 h-12 text-red-500 mb-1.5 group-hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
    return (
      <svg className="w-12 h-12 text-slate-400 mb-1.5 group-hover:text-slate-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">Manajemen Dokumen</h3>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => fileInputRef.current?.click()} className="py-1.5 px-3 text-sm bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
              {isUploading ? 'Mengupload...' : '+ Upload File'}
            </Button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept={ALLOWED_EXTS.join(',')}
              onChange={handleFileUpload}
            />
            <Button onClick={() => setShowAddFolder(!showAddFolder)} className="py-1.5 px-3 text-sm" variant="secondary">
              + Buat Folder
            </Button>
          </div>
        )}
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {showAddFolder && (
        <form onSubmit={handleAddFolder} className="mb-6 flex gap-2 max-w-sm">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nama folder..."
            className="form-input flex-1"
            autoFocus
          />
          <Button type="submit">Simpan</Button>
          <Button type="button" variant="secondary" onClick={() => setShowAddFolder(false)}>Batal</Button>
        </form>
      )}

      <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <button onClick={() => setCurrentFolder(null)} className="hover:text-emerald-600">
          Root Folder
        </button>
        {currentFolder && (
          <>
            <span>/</span>
            <span className="text-slate-900">{currentFolder.nama}</span>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 transition-opacity ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
          {folders.map((folder) => (
            <div key={folder.id} className="border border-slate-200 p-3 rounded-lg hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all group flex flex-col items-center text-center relative h-32" onClick={() => !editingItem && setCurrentFolder(folder)}>
              <svg className="w-12 h-12 text-emerald-400 mb-1.5 group-hover:text-emerald-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              
              {editingItem?.id === folder.id && editingItem.type === 'folder' ? (
                <form onSubmit={handleRename} className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full text-xs p-1 border border-emerald-500 rounded outline-none"
                    autoFocus
                    onBlur={() => setEditingItem(null)}
                  />
                </form>
              ) : (
                <span className="text-xs font-medium text-slate-700 truncate w-full mt-1 px-1">{folder.nama}</span>
              )}
              
              {canManage && !editingItem && (
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-slate-500 p-1 hover:bg-slate-100 rounded"
                    onClick={(e) => { e.stopPropagation(); setEditingItem({ id: folder.id, type: 'folder', name: folder.nama }); }}
                    title="Ubah Nama"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    title="Hapus Folder"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {files.map((file) => (
            <div key={`file-${file.id}`} className="border border-slate-200 p-3 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col items-center text-center relative h-32" onClick={() => !editingItem && handleViewFile(file)}>
              {getFileIcon(file.mime_type)}
              
              {editingItem?.id === file.id && editingItem.type === 'file' ? (
                <form onSubmit={handleRename} className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full text-xs p-1 border border-blue-500 rounded outline-none"
                    autoFocus
                    onBlur={() => setEditingItem(null)}
                  />
                </form>
              ) : (
                <span className="text-xs font-medium text-slate-700 truncate w-full mt-1 px-1 cursor-pointer" title={file.original_name}>{file.original_name}</span>
              )}
              
              <span className="text-[10px] text-slate-400 mt-auto">{file.size_kb} KB</span>
              
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 rounded backdrop-blur-sm">
                <button 
                  className="text-emerald-600 p-1 hover:bg-emerald-50 rounded cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                  title="Download File"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                {canManage && !editingItem && (
                  <>
                    <button 
                      className="text-slate-500 p-1 hover:bg-slate-100 rounded cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setEditingItem({ id: file.id, type: 'file', name: file.original_name.split('.').slice(0, -1).join('.') || file.original_name }); }}
                      title="Ubah Nama"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                      title="Hapus File"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {folders.length === 0 && files.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              <p>Folder & File masih kosong</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
