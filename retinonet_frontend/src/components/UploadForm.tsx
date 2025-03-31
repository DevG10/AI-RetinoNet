import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Eye, Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Reset error state
    setError(null);
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
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Show realistic progress animation
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            
            // Simulate realistic upload progress behavior
            const increment = Math.random() * 15 * (100 - prev) / 100;
            return Math.min(prev + increment, 95);
          });
        }, 300);
        return interval;
      };
      
      const progressInterval = simulateProgress();

      const response = await axios.post("https://ai-retinonet.onrender.com/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000, // 30 second timeout
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setPredictions(response.data.predictions);
      setFile(selectedFile);
      
      toast.success("Retina scan analyzed successfully!", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Unable to process your retina scan. Please try again.");
      toast.error("Error analyzing retina scan.", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
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
        className="text-center space-y-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
          Retina Analysis
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Upload a high-quality retina scan for our AI to analyze and detect potential conditions
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-700 shadow-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 transition-all duration-300 hover:shadow-2xl"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/10 to-teal-500/5"
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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400"></div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 z-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md hover:bg-red-50 hover:text-red-500 transition-all duration-300" 
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="overflow-hidden p-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-xl overflow-hidden shadow-inner"
              >
                <motion.img 
                  src={preview} 
                  alt="Retina scan preview" 
                  className="h-64 w-full object-contain" 
                />
                <motion.div 
                  className="absolute inset-0 ring-1 ring-inset ring-teal-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </motion.div>
            </div>
            
            {/* File name display */}
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              error 
                ? "border-red-300 bg-red-50/50 dark:bg-red-900/10 dark:border-red-700" 
                : dragActive 
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10" 
                  : "border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/10"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                className="rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-4 dark:from-teal-900/40 dark:to-cyan-900/40"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity, 
                  repeatType: "loop" 
                }}
              >
                <ImageIcon className="h-10 w-10 text-teal-600 dark:text-teal-400" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">
                  {error ? (
                    <span className="text-red-600 dark:text-red-400">{error}</span>
                  ) : (
                    <span>Drop your retina scan here</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Support for JPG, PNG and TIFF files
                </p>
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
                className="gap-2 border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400"
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
              <span className="text-teal-700 dark:text-teal-300 font-medium flex items-center">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block w-2 h-2 bg-teal-500 rounded-full mr-2"
                />
                Analyzing retina scan...
              </span>
              <span className="font-mono text-teal-600 dark:text-teal-400">{Math.round(uploadProgress)}%</span>
            </div>
            
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-50"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"]
                  }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                  style={{
                    backgroundSize: "10px 10px",
                    backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center pt-2">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || loading}
          size="lg"
          className={`gap-2 relative overflow-hidden ${
            !selectedFile 
              ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed" 
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          } transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 rounded-full px-10 py-7 font-medium text-white`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="relative z-10">Analyzing...</span>
              
              {/* Loading background animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700"
                animate={{ 
                  x: ["0%", "100%", "0%"],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "linear"
                }}
              />
            </>
          ) : (
            <>
              <Eye className="h-5 w-5" />
              <span className="relative z-10">Analyze Retina Scan</span>
              
              {/* Hover overlay animation */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 1 }}
              />
            </>
          )}
        </Button>
      </div>
      
      {/* Info hint for users */}
      {!selectedFile && !loading && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2"
        >
          Our AI works best with clear, focused retina images
        </motion.p>
      )}
    </motion.div>
  );
};

export default UploadForm;
