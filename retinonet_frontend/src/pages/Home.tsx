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

const Home = () => {
  const [predictions, setPredictions] = useState<Record<string, string> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [useLiveCapture, setUseLiveCapture] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-slate-950 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-200 dark:border-blue-900 sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
            <Activity className="h-6 w-6 mr-2 text-blue-500" /> RetinoNet AI Diagnosis
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 md:px-6 lg:py-12 max-w-6xl mx-auto">
        <Card className="mb-8 overflow-hidden border-none rounded-2xl shadow-xl bg-white dark:bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-50"></div>
          <CardContent className="p-6 relative">
            <div className="flex gap-4 mb-6">
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${useLiveCapture 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'}`}
                onClick={() => setUseLiveCapture(false)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Upload File
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${useLiveCapture 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                onClick={() => setUseLiveCapture(true)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Live Capture
              </button>
            </div>

            {useLiveCapture ? (
              <LiveCapture setPredictions={setPredictions} setFile={setFile} />
            ) : (
              <UploadForm setPredictions={setPredictions} setFile={setFile} />
            )}
          </CardContent>
        </Card>

        {predictions && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card className="shadow-lg rounded-2xl border-blue-100 dark:border-blue-900 overflow-hidden transform transition-transform hover:scale-[1.01] duration-300">
              <CardContent className="p-0">
                <Predictions predictions={predictions} />
              </CardContent>
            </Card>

            {file && (
              <Card className="shadow-lg rounded-2xl border-blue-100 dark:border-blue-900 overflow-hidden transform transition-transform hover:scale-[1.01] duration-300">
                <Tabs defaultValue="report" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-blue-50 dark:bg-blue-950/50 rounded-t-xl">
                    <TabsTrigger value="report" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Report</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md">
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email Report</span>
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
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200 dark:border-blue-900 py-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <div className="container flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            © {new Date().getFullYear()} RetinoNet AI. All rights reserved.
          </p>
        </div>
      </footer>
      
      <Toaster richColors closeButton position="top-center"/>
    </div>
  );
};

export default Home;
