import "styles/ui/CardLayout.css";

const CardLayout = ({ children, title, showLogo = true }) => {
    return (
        <div className="card-wrapper">
            <div className="card">
                {showLogo ? <h2 className="logo">Granite</h2> : null}
                <h1 className="title">{title}</h1>
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
  };

  
  export default CardLayout;
  