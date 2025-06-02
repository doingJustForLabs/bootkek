import React from 'react';
import 'styles/ui/InfoCard.css';
import DetailsButton from "components/ui/buttons/DetailsButton.jsx";

const InfoCard = ({ title, statistics, children, handleDetails }) => {

    return (
        <div className="info-card">
            <div className="header">
                {title && <h2 className="title">{title}</h2>}
                {statistics !== 0 && <span className="statistics">{statistics}</span>}
                {handleDetails && (<DetailsButton onClick={handleDetails} style={{color: "white", fontSize: "24px", marginLeft: "auto"}}/>)}
            </div>
            <div className="info-card-content">
                {children}
            </div>
        </div>
    );
};

export default InfoCard;