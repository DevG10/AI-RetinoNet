import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, AtSign, Sparkles, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EmailForm = ({ file, predictions }: { file: File | null; predictions: any }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendEmail = async () => {
    if (!file || !predictions) {
      toast.error("Upload an image and get predictions first.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("predictions", JSON.stringify(Object.values(predictions)));
    formData.append("email", email);

    try {
      const response = await fetch("http://localhost:8000/send_report/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      toast.success("Email sent successfully!");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error sending email.");
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
        className="text-sm text-muted-foreground mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm"
      >
        <p className="font-medium text-blue-700 dark:text-blue-300 flex items-center">
          <Mail className="w-4 h-4 mr-2 opacity-70" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Email Your Results
          </span>
        </p>
        <p className="mt-1">Send your diagnostic report to your email for safekeeping or to share with your doctor.</p>
      </motion.div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
          <AtSign className="h-3.5 w-3.5 text-blue-500" />
          Email Address
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <AtSign className="h-4 w-4 text-blue-500" />
            </motion.div>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSendEmail} 
        disabled={loading || !email}
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
            <span className="animate-pulse">Sending Email...</span>
            {/* Particle effects while loading */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                  animate={{
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: [0.8, 0.2, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Email Sent Successfully!</span>
            {/* Success sparkles animation */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            Send Report via Email
            {/* Background gradient animation on hover */}
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />
          </>
        )}
      </Button>
      
      {/* Decorative dots */}
      <div className="flex justify-center space-x-1.5 mt-2">
        {[0, 1, 2].map((i) => (
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

export default EmailForm;
