import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    { id: 1, name: 'Registrierung' },
    { id: 2, name: 'Zahlungs-Verifizierung' }
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-4">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex items-center space-x-3">
              {/* Step Circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                ${index + 1 < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index + 1 === currentStep 
                    ? 'bg-[#C80000] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1 < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step?.id
                )}
              </div>
              
              {/* Step Label */}
              <span className={`text-sm font-medium ${
                index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step?.name}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps?.length - 1 && (
              <div className={`w-12 h-px transition-colors duration-200 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;