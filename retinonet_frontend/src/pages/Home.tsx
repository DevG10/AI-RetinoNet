import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import LiveCapture from "@/components/LiveCapture";
import Predictions from "@/components/Predictions";
import Report from "@/components/Report";
import EmailForm from "@/components/EmailForm";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Camera, Eye, Activity } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const [predictions, setPredictions] = useState<Record<string, string> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [useLiveCapture, setUseLiveCapture] = useState(false);

  // Animation variants for decorative elements
  const floatingAnimation = {
    initial: { y: 0 },
    animate: { 
      y: ["-10px", "10px", "-10px"],
      transition: { 
        repeat: Infinity, 
        duration: 5,
        ease: "easeInOut" 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-950 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Gradient Circles */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-300/20 dark:from-blue-500/10 dark:to-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-300/30 dark:from-indigo-500/10 dark:to-purple-500/15 blur-3xl"></div>
        
        {/* Floating Shapes */}
        <motion.div 
          className="absolute top-[15%] left-[10%] w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10"
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
        />
        <motion.div 
          className="absolute top-[40%] right-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-400/10 dark:to-purple-400/10"
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "1s" }}
        />
        <motion.div 
          className="absolute bottom-[20%] left-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10"
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "2s" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Header */}
      <header className="border-b border-blue-200/70 dark:border-blue-800/50 sticky top-0 z-10 backdrop-blur-xl bg-white/60 dark:bg-slate-900/70 shadow-md">
        <div className="container flex h-20 items-center justify-between px-4 md:px-6">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Activity className="h-6 w-6 mr-2 text-blue-500" /> 
            <span>RetinoNet AI Diagnosis</span>
          </motion.h1>
          
          {/* Theme toggle or other header elements could go here */}
          <motion.div 
            className="hidden md:flex items-center space-x-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              <span>AI-Powered Diagnosis</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 md:px-6 lg:py-12 max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-8 overflow-hidden border-none rounded-3xl shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-white/50 to-indigo-100/80 dark:from-blue-900/30 dark:via-slate-900/50 dark:to-indigo-900/30 opacity-80"></div>
            
            {/* Decorative elements inside card */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-600/10 dark:to-indigo-600/10 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-600/10 dark:to-purple-600/10 blur-2xl"></div>
            
            <CardContent className="p-8 relative">
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${useLiveCapture 
                    ? 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-800' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white border border-transparent'}`}
                  onClick={() => setUseLiveCapture(false)}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Upload File
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${useLiveCapture 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white border border-transparent' 
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-800'}`}
                  onClick={() => setUseLiveCapture(true)}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Live Capture
                </motion.button>
              </div>

              {useLiveCapture ? (
                <LiveCapture setPredictions={setPredictions} setFile={setFile} />
              ) : (
                <UploadForm setPredictions={setPredictions} setFile={setFile} />
              )}
            </CardContent>
          </Card>

          {predictions && (
            <motion.div 
              className="mt-12 grid gap-8 md:grid-cols-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="shadow-xl rounded-3xl border-blue-100/50 dark:border-blue-900/50 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transform transition-all duration-300">
                  <CardContent className="p-0">
                    <Predictions predictions={predictions} />
                  </CardContent>
                </Card>
              </motion.div>

              {file && (
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card className="shadow-xl rounded-3xl border-blue-100/50 dark:border-blue-900/50 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transform transition-all duration-300">
                    <Tabs defaultValue="report" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 p-1.5 bg-blue-50/80 dark:bg-blue-950/50 rounded-t-2xl">
                        <TabsTrigger value="report" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3">
                          <FileText className="h-4 w-4" />
                          <span>Download Report</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3">
                          <Mail className="h-4 w-4" />
                          <span>Email Report</span>
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="report" className="p-6">
                        <Report file={file} predictions={predictions} />
                      </TabsContent>
                      <TabsContent value="email" className="p-6">
                        <EmailForm file={file} predictions={predictions} />
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200/50 dark:border-blue-900/50 py-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md relative z-10">
        <div className="container flex flex-col items-center justify-center gap-3 text-center">
          <motion.div 
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Activity className="h-5 w-5" />
            <span className="font-semibold">RetinoNet AI</span>
          </motion.div>
          
          <p className="text-sm text-blue-700/80 dark:text-blue-400/80 max-w-md">
            Advanced retinal diagnostic technology powered by artificial intelligence to help detect retinal conditions early.
          </p>
          
          <div className="flex space-x-4 mt-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          </div>
          
          <p className="text-sm text-blue-700/70 dark:text-blue-400/70 mt-1">
            © {new Date().getFullYear()} RetinoNet AI. All rights reserved.
          </p>
        </div>
      </footer>
      
      <Toaster richColors closeButton position="top-center"/>
      
      {/* Add global CSS for grid pattern */}
      <style>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(66, 153, 225, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(66, 153, 225, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default Home;
