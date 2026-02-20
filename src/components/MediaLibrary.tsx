import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Trash2, Check, Image as ImageIcon, X as XIcon, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { supabase, MediaFile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MediaLibraryProps {
  onNavigate?: (view: string) => void;
  onSelectMedia?: (url: string) => void;
}

export default function MediaLibrary({ onNavigate, onSelectMedia }: MediaLibraryProps) {
  const { profile } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const files = data || [];
      setMediaFiles(files);
      setSelectedFiles((previous) => {
        const existing = new Set(files.map((file) => file.id));
        return new Set([...previous].filter((id) => existing.has(id)));
      });
    } catch (error) {
      console.error('Error loading media:', error);
      setActionMessage({ type: 'error', text: 'Erreur lors du chargement des médias.' });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!profile?.id) {
      setActionMessage({ type: 'error', text: 'Utilisateur non identifié: impossible d\'uploader.' });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of acceptedFiles) {
      try {
        let fileToUpload = file;

        if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };

          try {
            fileToUpload = await imageCompression(file, options);
          } catch (compressionError) {
            console.warn('Image compression failed, uploading original:', compressionError);
          }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        let width, height;
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            img.onload = () => {
              width = img.width;
              height = img.height;
              URL.revokeObjectURL(img.src);
              resolve(null);
            };
            img.onerror = () => {
              URL.revokeObjectURL(img.src);
              resolve(null);
            };
          });
        }

        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: fileName,
            original_filename: file.name,
            file_path: publicUrl,
            file_size: fileToUpload.size,
            mime_type: file.type,
            width,
            height,
            uploaded_by: profile?.id,
          });

        if (dbError) throw dbError;
        successCount += 1;
      } catch (error) {
        console.error('Error uploading file:', error);
        errorCount += 1;
      }
    }

    setUploading(false);
    await loadMedia();
    if (successCount > 0 && errorCount === 0) {
      setActionMessage({ type: 'success', text: `${successCount} fichier(s) uploadé(s) avec succès.` });
    } else if (successCount > 0 && errorCount > 0) {
      setActionMessage({ type: 'error', text: `${successCount} fichier(s) uploadé(s), ${errorCount} en erreur.` });
    } else if (errorCount > 0) {
      setActionMessage({ type: 'error', text: `Échec de l'upload (${errorCount} fichier(s)).` });
    }
  }, [profile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm'],
    },
  });

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`Supprimer ${file.original_filename} ?`)) return;

    try {
      if (!file.uploaded_by || !file.filename) {
        throw new Error('Informations de stockage manquantes');
      }

      const filePath = `${file.uploaded_by}/${file.filename}`;

      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      await loadMedia();
      setActionMessage({ type: 'success', text: 'Média supprimé.' });
    } catch (error) {
      console.error('Error deleting file:', error);
      setActionMessage({ type: 'error', text: 'Erreur lors de la suppression du média.' });
    }
  };

  const toggleSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Supprimer ${selectedFiles.size} fichier(s) ?`)) return;

    setDeleting(true);
    let deletedCount = 0;
    let failedCount = 0;
    for (const fileId of selectedFiles) {
      const file = mediaFiles.find(f => f.id === fileId);
      if (file) {
        try {
          if (!file.uploaded_by || !file.filename) {
            throw new Error('Informations de stockage manquantes');
          }

          const filePath = `${file.uploaded_by}/${file.filename}`;

          await supabase.storage.from('media').remove([filePath]);
          await supabase.from('media_files').delete().eq('id', file.id);
          deletedCount += 1;
        } catch (error) {
          console.error('Error deleting file:', error);
          failedCount += 1;
        }
      }
    }
    setSelectedFiles(new Set());
    setDeleting(false);
    await loadMedia();
    if (deletedCount > 0 && failedCount === 0) {
      setActionMessage({ type: 'success', text: `${deletedCount} fichier(s) supprimé(s).` });
    } else if (deletedCount > 0 && failedCount > 0) {
      setActionMessage({ type: 'error', text: `${deletedCount} supprimé(s), ${failedCount} en erreur.` });
    } else {
      setActionMessage({ type: 'error', text: 'Aucune suppression effectuée.' });
    }
  };

  const copyUrl = async (fileId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccessId(fileId);
      setTimeout(() => {
        setCopySuccessId((current) => (current === fileId ? null : current));
      }, 1800);
    } catch (error) {
      console.error('Clipboard error:', error);
      setActionMessage({ type: 'error', text: 'Impossible de copier l\'URL.' });
    }
  };

  const filteredFiles = mediaFiles.filter((file) =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const areAllFilteredSelected =
    filteredFiles.length > 0 && filteredFiles.every((file) => selectedFiles.has(file.id));

  const toggleSelectAllFiltered = () => {
    const newSelection = new Set(selectedFiles);
    if (areAllFilteredSelected) {
      filteredFiles.forEach((file) => newSelection.delete(file.id));
    } else {
      filteredFiles.forEach((file) => newSelection.add(file.id));
    }
    setSelectedFiles(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {actionMessage && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium flex items-center justify-between ${actionMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="ml-3 text-xs underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au tableau de bord</span>
        </button>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Bibliothèque de médias
        </h2>
        <p className="text-gray-600">
          Gérez vos images et vidéos pour vos pages SEO
        </p>
      </div>

      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${isDragActive
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
            }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>

          {uploading ? (
            <p className="text-lg font-medium text-gray-900">Upload en cours...</p>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-gray-900">Déposez les fichiers ici</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez-déposez des fichiers ici
              </p>
              <p className="text-gray-600">
                ou cliquez pour sélectionner (images et vidéos)
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un fichier..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        {filteredFiles.length > 0 && (
          <button
            onClick={toggleSelectAllFiltered}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            {areAllFilteredSelected ? 'Tout désélectionner (résultats visibles)' : 'Tout sélectionner (résultats visibles)'}
          </button>
        )}
      </div>

      {selectedFiles.size > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {selectedFiles.size} fichier(s) selectionne(s)
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="flex items-center space-x-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Suppression...' : 'Supprimer'}</span>
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Deselectionner
            </button>
          </div>
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? 'Aucun résultat' : 'Aucun média'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Essayez avec un autre terme de recherche'
              : 'Uploadez votre premier fichier pour commencer'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all ${selectedFiles.has(file.id)
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="aspect-square bg-gray-100 relative">
                {file.mime_type.startsWith('image/') ? (
                  <img
                    src={file.file_path}
                    alt={file.alt_text || file.original_filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <button
                  onClick={() => toggleSelection(file.id)}
                  aria-label={selectedFiles.has(file.id) ? 'Désélectionner ce média' : 'Sélectionner ce média'}
                  className="absolute top-2 left-2 z-20 w-6 h-6 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center transition-all hover:border-black"
                >
                  {selectedFiles.has(file.id) && (
                    <Check className="w-4 h-4 text-black" />
                  )}
                </button>

                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleSelection(file.id)}
                  className="sr-only"
                  aria-label={`Sélectionner ${file.original_filename}`}
                />

                <div
                  className="absolute inset-0 z-10 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-none group-hover:pointer-events-auto"
                  onClick={() => setPreviewFile(file)}
                >
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    {onSelectMedia && (
                      <button
                        onClick={() => onSelectMedia(file.file_path)}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Utiliser
                      </button>
                    )}
                    <button
                      onClick={() => copyUrl(file.id, file.file_path)}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      {copySuccessId === file.id ? 'URL copiée' : 'Copier URL'}
                    </button>
                    <button
                      onClick={() => deleteFile(file)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.original_filename}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file_size / 1024).toFixed(1)} KB
                  {file.width && file.height && ` • ${file.width}×${file.height}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setPreviewFile(null)}
        >
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <XIcon className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {previewFile.mime_type.startsWith('image/') ? (
              <img
                src={previewFile.file_path}
                alt={previewFile.alt_text || previewFile.original_filename}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : previewFile.mime_type.startsWith('video/') ? (
              <video
                src={previewFile.file_path}
                controls
                className="max-w-full max-h-[80vh] rounded-lg"
              />
            ) : null}
            <div className="mt-3 text-center text-white text-sm">
              <p className="font-medium">{previewFile.original_filename}</p>
              <p className="text-gray-400">
                {(previewFile.file_size / 1024).toFixed(1)} KB
                {previewFile.width && previewFile.height && ` - ${previewFile.width}x${previewFile.height}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
