interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  file: File | undefined;
}

export default function UserPhotoDataForm({ setStep, setFile, file }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
    }
  };

  return (
    <div className="form-step">
      <h1>User Photo</h1>

      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="file"
          style={{ display: "block", marginBottom: "10px" }}
        >
          Select one photo:
        </label>
        <input
          type="file"
          id="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div style={{ marginBottom: "20px" }}>
          <p>Selected files:</p>
          <ul>
            <li>{file.name}</li>
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
