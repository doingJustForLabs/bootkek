import '../../../public/assets/styles/StepProgress.css';

const StepProgress = ({ currentStep }) => {
    const steps = [1, 2, 3];

    return (
        <div className="step-progress">
            {steps.map((step, index) => (
                <div className="step-container" key={step}>
                    <div
                        className={`step-circle ${
                            step < currentStep
                                ? 'completed'
                                : step === currentStep
                                    ? 'current'
                                    : 'upcoming'
                        }`}
                    >
                        {step}
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`step-line ${step < currentStep ? 'completed' : 'upcoming'}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepProgress;