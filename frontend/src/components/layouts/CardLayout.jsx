import "styles/ui/CardLayout.css";
import GraniteLogo from "components/GraniteLogo.jsx";
import React from "react";

const CardLayout = ({ children, title, showLogo = true, style={} }) => {
    return (
        <div className="card-wrapper">
            <div className="card" style={style}>
                {showLogo ?
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <GraniteLogo style={{ width: 64, height: 64, fill: "#596acc", marginRight: "10px"}} />
                        <h1 className="logo">Granite</h1>
                    </div>
                    : null}
                <h1 className="title">{title}</h1>
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
  };

  
  export default CardLayout;
  