import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Eye, Upload, X, Image as ImageIcon, Loader2, FileUp, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UploadFormProps {
  setPredictions: (predictions: Record<string, string>) => void;
  setFile: (file: File | null) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ setPredictions, setFile }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFile(event.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setFile(null);
    setPredictions({});
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 200);

      const response = await axios.post("http://localhost:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(interval);
      setUploadProgress(100);
      
      setPredictions(response.data.predictions);
      setFile(selectedFile);
      
      toast.success("Retina scan analyzed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error analyzing retina scan.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      <motion.div 
        className="text-center space-y-2"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Retina Analysis
        </h2>
        <p className="text-muted-foreground">Upload a retina scan image for AI-powered diagnosis</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative mx-auto max-w-md overflow-hidden rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 transition-all duration-300 hover:shadow-2xl"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-blue-500/5"
              animate={{ 
                x: ["0%", "100%", "0%"],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatType: "mirror",
                ease: "linear"
              }}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 z-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:bg-red-50 hover:text-red-500 transition-all duration-300" 
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="overflow-hidden">
              <motion.img 
                src={preview} 
                alt="Preview" 
                className="h-64 w-full object-contain p-2" 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              dragActive ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-300 dark:border-gray-700"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <ImageIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Drop your retina scan here</h3>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Select File
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar during analysis */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>Analyzing retina scan...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress 
              value={uploadProgress} 
              className="h-2 w-full"
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                style={{ width: `${uploadProgress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </Progress>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || loading}
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 rounded-full px-8 py-6 font-medium text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Eye className="h-5 w-5" />
              Analyze Retina Scan
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default UploadForm;
