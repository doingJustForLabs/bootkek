import React from 'react';

const InfoCard = ({ title, statistics, children }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "210px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.33)",
            borderRadius: "10px",
            overflow: "hidden",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: '#596acc',
                padding: "0 10px",
                gap: "5px",
                height: "30px",
                flexShrink: 0
            }}>
                {title ? <h2 style={{ fontSize: "16px", color: 'white', margin: 0 }}>{title}</h2> : null}
                {statistics ? <span style={{ fontSize: "13px", color: "#d5d7f8" }}>{statistics}</span> : null}
            </div>
            <div style={{
                backgroundColor: '#ededed',
                padding: "10px",
                flex: 1,
            }}>
                {children}
            </div>
        </div>
    );
};

export default InfoCard;