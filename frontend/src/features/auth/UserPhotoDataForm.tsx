import { useMemo, useEffect, useRef } from "react";

const useImagePreview = (file: File | undefined) => {
  const preview = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return preview;
};

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  file: File | undefined;
  existingImage?: string | null;
  setExistingImage?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function UserPhotoDataForm({
  setStep,
  setFile,
  file,
  existingImage,
  setExistingImage,
}: Props) {
  const preview = useImagePreview(file);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const displayImage = preview || existingImage;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Profile Photo
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Upload a picture about yourself.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col items-center justify-center space-y-6">
        <div className="w-full relative">
          <label
            htmlFor="file"
            className="flex flex-col w-full items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-inter text-text-muted font-bold text-sm">
              Click to select new photo
            </p>
            <p className="text-xs text-gray-500 mt-1">Up to 5MB</p>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {displayImage && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-40">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-white">
                <img
                  src={displayImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {!preview && existingImage && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-background font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-widest shadow-md z-10 whitespace-nowrap">
                  Saved
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setFile(undefined);
                  if (setExistingImage) setExistingImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xl z-[100] ring-2 ring-white"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 flex justify-between items-center flex-shrink-0 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={() => setStep((p) => p - 1)}
          className="text-text-muted hover:text-background font-bold tracking-widest uppercase text-sm transition-colors"
        >
          Go Back
        </button>
        <button
          type="submit"
          className="text-white bg-background hover:bg-primary-hover font-bold tracking-widest uppercase rounded-xl text-sm px-8 py-3.5 transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
