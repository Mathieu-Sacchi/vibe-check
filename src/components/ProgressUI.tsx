import React, { useEffect, useState } from "react";

interface Step {
  name: string;
  status: "pending" | "in-progress" | "completed";
}

const initialSteps = [
  "Context Analysis - Understanding project structure",
  "Security Analysis - Scanning for vulnerabilities", 
  "Performance Analysis - Checking for bottlenecks",
  "Quality Analysis - Reviewing code quality",
  "Frontend Analysis - Evaluating UI/UX patterns",
  "Final Aggregation - Combining all findings"
];

interface ProgressUIProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

export default function ProgressUI({ isAnalyzing, onComplete }: ProgressUIProps) {
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.map(name => ({ name, status: "pending" }))
  );

  useEffect(() => {
    if (!isAnalyzing) {
      // Reset steps when not analyzing
      setSteps(initialSteps.map(name => ({ name, status: "pending" })));
      return;
    }

    // Start the step progression
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < initialSteps.length) {
        // Mark current step as in-progress
        setSteps(prev => prev.map((step, index) => {
          if (index < currentStep) return { ...step, status: "completed" };
          if (index === currentStep) return { ...step, status: "in-progress" };
          return step;
        }));

        // After 6 seconds, mark as completed and move to next
        setTimeout(() => {
          setSteps(prev => prev.map((step, index) => {
            if (index <= currentStep) return { ...step, status: "completed" };
            return step;
          }));
          
          // If this was the last step, call onComplete
          if (currentStep === initialSteps.length - 1) {
            setTimeout(() => {
              onComplete?.();
            }, 1000);
          }
        }, 6000);

        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 7000); // Start next step after 7 seconds

    return () => clearInterval(stepInterval);
  }, [isAnalyzing, onComplete]);

  if (!isAnalyzing) {
    console.log('🔍 ProgressUI: Not analyzing, hiding component');
    return null;
  }
  
  console.log('🚀 ProgressUI: Rendering progress component');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-4 border-gray-200 border-t-black rounded-full mx-auto"></div>
          <div>
            <h3 className="text-xl font-semibold">Multi-Agent AI Analysis in Progress</h3>
            <p className="text-gray-600">Our specialized AI agents are examining your code...</p>
            <p className="text-sm text-gray-500 mt-2">Expected time: 45-60 seconds</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-center mb-4">Analysis Steps:</h4>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                step.status === "completed"
                  ? 'bg-green-500 text-white' 
                  : step.status === "in-progress"
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {step.status === "completed" ? '✓' : index + 1}
              </div>
              <span className={`${
                step.status === "completed"
                  ? 'text-green-700 font-medium' 
                  : step.status === "in-progress"
                    ? 'text-blue-700 font-medium' 
                    : 'text-gray-600'
              }`}>
                {step.name}
              </span>
              {step.status === "in-progress" && (
                <div className="ml-auto">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-200 border-t-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 