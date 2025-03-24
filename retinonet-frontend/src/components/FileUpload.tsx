import { useState } from "react";
import { uploadImage } from "@/api";
import { Button } from "@/components/ui/button";

const FileUpload = ({ onUploadSuccess }: { onUploadSuccess: (id: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await uploadImage(file);
      console.log("Upload successful", response.data);
      onUploadSuccess(response.data.image_id);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </Button>
    </div>
  );
};

export default FileUpload;
