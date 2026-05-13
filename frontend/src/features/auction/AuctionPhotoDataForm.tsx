interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  files: File[];
}

export default function AuctionPhotoDataForm({
  setStep,
  setFiles,
  files,
}: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  return (
    <div className="form-step">
      <h1>Watch Item Photos</h1>

      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="file"
          style={{ display: "block", marginBottom: "10px" }}
        >
          Select photos (multiple allowed):
        </label>
        <input
          type="file"
          id="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <p>Selected files:</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" onClick={() => setStep((p) => p - 1)}>
        Previous
      </button>

      <button type="submit">Submit</button>
    </div>
  );
}
