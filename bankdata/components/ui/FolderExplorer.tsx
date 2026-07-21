'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface Folder {
  id: number;
  nama: string;
  modul: string;
  parent_id: number | null;
}

interface FolderExplorerProps {
  modul: string;
}

export default function FolderExplorer({ modul }: FolderExplorerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchFolders = async (parentId: number | null) => {
    setLoading(true);
    try {
      const parentQuery = parentId ? `parent_id=${parentId}` : 'parent_id=null';
      const res = await fetch(`/api/folder?modul=${modul}&${parentQuery}`);
      const data = await res.json();
      if (data.data) {
        setFolders(data.data);
      }
    } catch (err) {
      setError('Gagal memuat folder.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders(currentFolder ? currentFolder.id : null);
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
        fetchFolders(currentFolder ? currentFolder.id : null);
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
        fetchFolders(currentFolder ? currentFolder.id : null);
      }
    } catch (err) {
      alert('Gagal menghapus folder');
    }
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">Manajemen Dokumen</h3>
        <Button onClick={() => setShowAddFolder(!showAddFolder)} className="py-1.5 px-3 text-sm">
          + Buat Folder Baru
        </Button>
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
        <p className="text-slate-500 py-6 text-center animate-pulse text-sm">Memuat folder...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {folders.map((folder) => (
            <div key={folder.id} className="border border-slate-200 p-3 rounded-lg hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all group flex flex-col items-center text-center relative" onClick={() => setCurrentFolder(folder)}>
              <svg className="w-12 h-12 text-emerald-400 mb-1.5 group-hover:text-emerald-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-xs font-medium text-slate-700 truncate w-full">{folder.nama}</span>
              <button 
                className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {folders.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              <p>Folder masih kosong</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
