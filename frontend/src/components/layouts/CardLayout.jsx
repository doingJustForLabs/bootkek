import "../../../public/assets/styles/Sandbox.css";

const CardLayout = ({ children, title }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="gradient-container absolute inset-0" />
                <div className="noise-overlay absolute inset-0" />
            </div>

            <div className="justify-items-center relative z-10 w-full max-w-md p-8 bg-amber-50 rounded-3xl shadow-xl">
                <h1 className="text-muctr text-4xl justify-center">{title}</h1>
                {children}
            </div>
        </div>
    );
  };
  
  export default CardLayout;
  