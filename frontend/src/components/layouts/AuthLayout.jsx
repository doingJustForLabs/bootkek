import "../Sandbox.css";

const AuthLayout = ({ children }) => {
    return (
      <div className="gradient-container">
        <div className="noise-overlay"/>
        <div className="flex-col justify-items-center content-center w-2/5 p-8 bg-amber-50 rounded-r-4xl">
          {children}
        </div>
      </div>
    );
  };
  
  export default AuthLayout;
  