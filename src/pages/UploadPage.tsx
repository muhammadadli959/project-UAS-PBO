import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { Artwork } from "../types";

export default function UploadPage() {
  const { session } = useAuth();
  const { addArtwork, categories, showToast } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "Other");
  const [artistName, setArtistName] = useState(session?.username || "");
  const [imageUrl, setImageUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !imageUrl.trim()) {
      setError("Title and Image URL are required.");
      return;
    }

    if (!session?.token) {
      setError("Please login before uploading artwork.");
      return;
    }

    const artwork: Artwork = {
      id: `art${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      artistName: artistName.trim() || session.username,
      imageUrl: imageUrl.trim(),
      uploadedBy: session.username,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await addArtwork(artwork, session.token);
      showToast("Artwork uploaded successfully!");
      navigate("/my-gallery");
    } catch (err: any) {
      setError(err?.message || "Failed to upload artwork. Please try again.");
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPreviewError(false);

    if (!file) {
      setImageUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Upload Artwork</h1>
          <p className="text-gray-500 text-sm mt-1">
            Share your creative work with the community
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#13131f] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Artwork title"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Artist Name
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              placeholder="Describe your artwork..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setPreviewError(false);
                setImageUrl(e.target.value);
              }}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Or choose an image file
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can paste an image URL above or upload a local image file.
            </p>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d1a]">
              <p className="text-xs text-gray-500 px-3 py-2 border-b border-white/5 flex items-center gap-1.5">
                <ImageIcon size={12} /> Preview
              </p>
              {previewError ? (
                <div className="p-4 text-sm text-red-300">
                  Unable to load preview. Check the image URL or select a
                  different file.
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                  onLoad={() => setPreviewError(false)}
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Upload size={16} />
            Upload Artwork
          </button>
        </form>
      </div>
    </div>
  );
}
