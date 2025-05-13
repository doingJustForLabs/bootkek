import "../../../public/assets/styles/Sandbox.css";

const AuthLayout = ({ children }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/*<div className="absolute inset-0 z-0">*/}
            {/*    <div className="gradient-container absolute inset-0" />*/}
            {/*    <div className="noise-overlay absolute inset-0" />*/}
            {/*</div>*/}

            <div className="justify-items-center relative z-10 w-full max-w-md p-8 bg-amber-50 rounded-3xl shadow-xl">
                <h1 className="text-muctr text-5xl">Granite</h1>
                {children}
            </div>
        </div>
    );
  };
  
  export default AuthLayout;
  