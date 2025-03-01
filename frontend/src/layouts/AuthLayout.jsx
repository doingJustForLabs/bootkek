const AuthLayout = ({ children }) => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[url(../public/assets/muctr-bg.png)]">
        <div className="flex-col justify-items-center w-full max-w-sm p-8 rounded-4xl bg-white shadow-md">
            <img className="w-3/5 m-6" src="../public/assets/muctr-logo.png" alt="РХТУ-лого" />
          {children}
        </div>
      </div>
    );
  };
  
  export default AuthLayout;
  