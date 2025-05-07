import "../Sandbox.css";
import StepProgress from "../ui/StepProgress.jsx";

const ProfileCreationLayout = ({step = 1, children}) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="gradient-container absolute inset-0" />
                <div className="noise-overlay absolute inset-0" />
            </div>

            <div className="justify-items-center relative z-10 w-full max-w-sm p-8 bg-amber-50 rounded-3xl shadow-xl">
                <h1 className="text-muctr justify-self-center text-2xl mb-5">Создание профиля!!!</h1>
                <StepProgress currentStep={step} />
                <div>{children}</div>
            </div>
        </div>
    );
};

export default ProfileCreationLayout;