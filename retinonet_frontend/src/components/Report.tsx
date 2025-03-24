import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Report = ({ file, predictions }: { file: File | null; predictions: any }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async () => {
    if (!file || !predictions) {
      toast.error("Upload an image and get predictions first.");
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("predictions", JSON.stringify(Object.values(predictions)));

    try {
      const response = await fetch("https://ai-retinonet.onrender.com/generate_report/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "RetinoNet_Report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Report generated successfully!");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <motion.div 
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="text-sm text-muted-foreground bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm"
      >
        <p className="font-medium text-blue-700 dark:text-blue-300 flex items-center">
          <FileText className="w-4 h-4 mr-2 opacity-70" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Download Your Report
          </span>
        </p>
        <p className="mt-1">Generate a detailed PDF report with your retina scan results that you can share with your healthcare provider.</p>
      </motion.div>
      
      <Button 
        onClick={handleGenerateReport} 
        disabled={loading}
        className={`w-full relative overflow-hidden group ${
          success 
            ? "bg-green-600 hover:bg-green-700" 
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800"
        } transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 rounded-md py-6 font-medium text-white`}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="animate-pulse">Generating Report...</span>
            {/* Paper generation animation */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  animate={{
                    y: [0, -40, 0],
                    x: i % 2 === 0 ? [0, 10, 0] : [0, -10, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Report Downloaded!
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-green-500/20"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 1.5, repeat: 2 }}
            />
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
            Download PDF Report
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />
          </>
        )}
      </Button>
      
      {/* Animated download indicator */}
      {!loading && !success && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <ChevronDown className="h-5 w-5 text-blue-500/50" />
          </motion.div>
        </motion.div>
      )}
      
      {/* Decorative dots */}
      <div className="flex justify-center space-x-1.5 mt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i} 
            className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-600"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.3 
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Report;
