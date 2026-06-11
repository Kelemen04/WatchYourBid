import { useEffect, useState } from "react";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  files: File[];
  // Opcionális proppok a már meglévő (adatbázisból jövő) képek kezeléséhez
  existingImages?: string[];
  setExistingImages?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AuctionPhotoDataForm({
  setStep,
  setFiles,
  files,
  existingImages = [],
  setExistingImages,
}: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // 1. Legeneráljuk a memóriacímeket a képekhez
    const objectUrls = files.map((file) => URL.createObjectURL(file));

    // 2. Egy aszinkron timeout-ba csomagoljuk a setState-et
    const timeoutId = setTimeout(() => {
      setPreviews(objectUrls);
    }, 0);

    // 3. Takarítás: töröljük a timeout-ot és felszabadítjuk a memóriát
    return () => {
      clearTimeout(timeoutId);
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      // Megtartjuk a régi fájlokat is, és hozzáadjuk az újakat
      setFiles((prevFiles) => [...prevFiles, ...fileArray]);
    }
  };

  // ÚJ kért fájl eltávolítása index alapján
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  // RÉGI (szerveren lévő) kép eltávolítása URL alapján
  const handleRemoveExistingImage = (urlToRemove: string) => {
    if (setExistingImages) {
      setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
    }
  };

  // Összeszámoljuk, hány képünk van összesen (régi + új)
  const totalImagesCount = existingImages.length + files.length;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
      {/* Fejléc - FIX */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Upload Photos
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Add high-quality images of your watch to attract bidders.
        </p>
      </div>

      {/* GÖRGETHETŐ TARTALOM (Függőlegesen görget a teljes törzs, ha szükséges) */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Feltöltő zóna */}
        <div className="flex flex-col w-full items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer flex-shrink-0">
          <input
            type="file"
            id="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
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
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        </div>

        {/* VÍZSZINTESEN GÖRGETHETŐ KÉPLISTA (Megjelenik, ha van akár régi, akár új kép) */}
        {(existingImages.length > 0 || previews.length > 0) && (
          <div className="flex flex-col flex-shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-3 block">
              Selected Photos ({totalImagesCount})
            </label>

            {/* Vízszintes görgetősáv */}
            <div className="flex flex-row overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {/* 1. RÉGI KÉPEK MEGJELENÍTÉSE (Ha vannak) */}
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border-2 border-primary/40 shadow-sm bg-white group"
                >
                  <img
                    src={url}
                    alt={`existing-${index}`}
                    className="object-cover w-full h-full"
                  />

                  {/* Jelvény, hogy lásd ez már fent van a szerveren (opcionális dizájn elem) */}
                  <span className="absolute bottom-1 left-1 bg-primary text-background font-bold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                    Saved
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md z-10"
                    title="Delete existing photo from server"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* 2. ÚJONNAN KIVÁLASZTOTT KÉPEK MEGJELENÍTÉSE */}
              {previews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white group"
                >
                  <img
                    src={preview}
                    alt={`preview-${index}`}
                    className="object-cover w-full h-full"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md z-10"
                    title="Remove new photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigációs gombok az oldal alján - FIX */}
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
          {existingImages.length > 0 || files.length > 0
            ? "Save Changes"
            : "Create Auction"}
        </button>
      </div>
    </div>
  );
}
