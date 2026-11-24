import React, { useState } from 'react';
import { X, MapPin, Tag } from 'lucide-react';
import type { HeritagePost } from '../../data/socialFeedData';
import { apiService } from '../../services/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: HeritagePost) => void;
}

const SAMPLE_HERITAGE_IMAGES = [
  { label: 'Hampi Monoliths', url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mysore Palace', url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Konark Sun Temple', url: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kerala Traditions', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Varanasi Sanctum', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('Hampi, Karnataka');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_HERITAGE_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [hashtags, setHashtags] = useState('#Hampi #Karnataka #Heritage');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setFilePreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setErrorMsg('Please enter a caption for your cultural discovery');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      let finalMediaUrl = customImageUrl.trim() || selectedImage;

      // If user selected a local file, upload to server first
      if (uploadFile) {
        const uploadRes = await apiService.uploadMedia(uploadFile, 'posts');
        finalMediaUrl = uploadRes.url;
      }

      const tagsArray = hashtags
        .split(' ')
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .filter((t) => t.length > 1);

      // Persist directly to Turso Cloud DB via backend
      const createdPost = await apiService.createPost({
        location: location.trim() || 'India',
        mediaUrl: finalMediaUrl,
        caption: caption.trim(),
        hashtags: tagsArray.length > 0 ? tagsArray : ['#IndianHeritage', '#Culture'],
      });

      onPostCreated(createdPost);
      setCaption('');
      setUploadFile(null);
      setFilePreview('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish post to Turso');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-6 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
          <h3 className="font-serif font-bold text-lg text-[#241a12]">
            Share a Cultural Heritage Discovery
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 hover:text-stone-800 transition-colors"
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
          {/* Local File Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Upload Image or Video from Device
            </label>
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileChange}
              className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#c5a059] file:text-[#16100c] hover:file:bg-[#b89047] cursor-pointer"
            />
          </div>

          {filePreview ? (
            <div className="rounded-xl overflow-hidden aspect-[16/10] bg-black border border-[#c5a059]">
              {uploadFile?.type.startsWith('video/') ? (
                <video src={filePreview} className="w-full h-full object-cover" controls />
              ) : (
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            /* Or Select from Verified Cultural Photography */
            <div>
              <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1.5">
                Or Select an Authentic Heritage Monument
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_HERITAGE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img.url);
                      setCustomImageUrl('');
                      setUploadFile(null);
                      setFilePreview('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      selectedImage === img.url && !uploadFile
                        ? 'border-[#c5a059] shadow-md scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Caption & Historical Context
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this ancient temple, ritual, or architectural wonder..."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-sm focus:outline-none focus:border-[#c5a059]"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Heritage Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hampi, Karnataka"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                required
              />
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
              Cultural Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#Hampi #Karnataka #Architecture"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-bold text-sm shadow-md transition-all disabled:opacity-60"
            >
              {isUploading ? 'Uploading & Preserving...' : 'Publish to Heritage Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
