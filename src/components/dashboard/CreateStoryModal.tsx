import React, { useState } from 'react';
import { X, Clock, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(user?.name || 'Your Story');
  const [category, setCategory] = useState('Sacred Rituals');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      setErrorMsg('Please select a photo or short clip for your story');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      // 1. Upload media
      const uploadRes = await apiService.uploadMedia(mediaFile, 'stories');

      // 2. Publish story in Turso Cloud DB (active for 24h)
      await apiService.createStory({
        title: title.trim(),
        category,
        mediaUrl: uploadRes.url,
      });

      onStoryCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish story');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-6 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c5a059]" />
            <h3 className="font-serif font-bold text-lg text-[#241a12]">
              Share a 24-Hour Heritage Story
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 hover:text-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Story Media (Photo or Video)
            </label>
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileChange}
              className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#c5a059] file:text-[#16100c] hover:file:bg-[#b89047] cursor-pointer"
              required
            />
          </div>

          {mediaPreview && (
            <div className="w-36 aspect-[9/16] rounded-xl overflow-hidden bg-black mx-auto border-2 border-[#c5a059] shadow-md">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} className="w-full h-full object-cover" controls />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Story Title / Caption
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
            >
              <option value="Sacred Rituals">Sacred Rituals</option>
              <option value="Temple Wonders">Temple Wonders</option>
              <option value="Dance & Drama">Dance & Drama</option>
              <option value="Festival Lights">Festival Lights</option>
              <option value="Daily Heritage">Daily Heritage</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f4efe6] text-stone-600 text-xs">
            <Clock className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
            <span>Stories remain visible to all custodians for 24 hours.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-bold text-sm shadow-md transition-all disabled:opacity-60"
            >
              {isUploading ? 'Publishing Story...' : 'Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
