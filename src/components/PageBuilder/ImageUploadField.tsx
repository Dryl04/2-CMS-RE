import { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import MediaLibrary from '../MediaLibrary';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImageUploadField({ label, value, onChange, placeholder }: ImageUploadFieldProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');

  const handleSelectMedia = (url: string) => {
    onChange(url);
    setShowMediaLibrary(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="flex items-center space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            inputMode === 'url'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="w-3 h-3 inline mr-1" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            inputMode === 'upload'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-3 h-3 inline mr-1" />
          Upload
        </button>
      </div>

      {inputMode === 'url' ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'https://...'}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowMediaLibrary(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Upload className="w-5 h-5 mx-auto mb-1" />
          Choisir ou uploader une image
        </button>
      )}

      {value && (
        <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={value}
            alt={label}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bibliotheque Media</h2>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <MediaLibrary onSelectMedia={handleSelectMedia} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
