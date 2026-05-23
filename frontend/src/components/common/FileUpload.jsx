import { useState } from 'react';
import { HiOutlinePhotograph } from 'react-icons/hi';

const FileUpload = ({ onUpload, currentImage, label = 'Upload Image' }) => {
  const [preview, setPreview] = useState(currentImage || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <HiOutlinePhotograph className="w-8 h-8 text-dark-300" />
          )}
        </div>
        <div>
          <label className="btn-secondary cursor-pointer text-sm inline-block">
            Choose File
            <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
          </label>
          <p className="text-xs text-dark-400 mt-1">Max 5MB. JPG, PNG, WebP</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
