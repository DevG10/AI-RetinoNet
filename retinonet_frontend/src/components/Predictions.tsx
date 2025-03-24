import { CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface PredictionsProps {
  predictions: Record<string, string>;
}

const getSeverityColor = (probability: number): "destructive" | "default" | "secondary" | "outline" => {
  if (probability >= 0.7) return "destructive";
  if (probability >= 0.4) return "secondary";
  return "default";
};

const getSeverityIcon = (probability: number) => {
  if (probability >= 0.7) return <AlertCircle className="h-4 w-4" />;
  if (probability >= 0.4) return <AlertTriangle className="h-4 w-4" />;
  return <CheckCircle className="h-4 w-4" />;
};

const getSeverityText = (probability: number): string => {
  if (probability >= 0.7) return "High Probability";
  if (probability >= 0.4) return "Moderate Probability";
  return "Low Probability";
};

const getSeverityGradient = (probability: number): string => {
  if (probability >= 0.7) return "from-red-500 to-red-600";
  if (probability >= 0.4) return "from-amber-500 to-amber-600";
  return "from-green-500 to-green-600";
};

const Predictions: React.FC<PredictionsProps> = ({ predictions }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full relative overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <CardHeader className="pb-3 pt-6">
        <CardTitle className="text-xl font-bold flex items-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
          </motion.div>
          <motion.span 
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent bg-300%"
          >
            Diagnostic Results
          </motion.span>
        </CardTitle>
      </CardHeader>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 p-6"
      >
        {Object.entries(predictions).map(([condition, probability], index) => {
          // Convert string probability to number for comparison
          const probValue = parseFloat(probability.replace("%", "")) / 100;
          const variant = getSeverityColor(probValue);
          const gradientClass = getSeverityGradient(probValue);
          
          return (
            <motion.div 
              key={index} 
              variants={item}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(241, 245, 249, 0.7)", 
                transition: { duration: 0.2 } 
              }}
              className="space-y-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{condition}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{probability}</span>
                  <Badge 
                    variant={variant} 
                    className={`flex items-center gap-1 ${
                      variant === "destructive" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                      variant === "secondary" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getSeverityIcon(probValue)}
                    </motion.div>
                    <span>{getSeverityText(probValue)}</span>
                  </Badge>
                </div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Progress 
                  value={parseFloat(probability.replace("%", ""))} 
                  className={`h-3 w-full bg-slate-100 dark:bg-slate-800 [&>*]:transition-all [&>*]:duration-500`}
                >
                  <div className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`} />
                </Progress>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Predictions;