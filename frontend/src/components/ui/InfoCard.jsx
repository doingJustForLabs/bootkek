import React from 'react';
import {Button, Tooltip} from "antd";
import {InfoCircleOutlined} from "@ant-design/icons";

const InfoCard = ({ title, statistics, children, handleDetails }) => {
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
                width: "100%",
                backgroundColor: '#596acc',
                padding: "0 10px",
                gap: "5px",
                height: "30px",
                flexShrink: 0
            }}>
                {title ? <h2 style={{ fontSize: "20px", color: 'white', margin: 0 }}>{title}</h2> : null}
                {statistics ? <span style={{ fontSize: "16px", color: "#d5d7f8" }}>{statistics}</span> : null}
                {handleDetails ? (
                    <Tooltip title="Подробнее...">
                        <Button
                            shape="circle"
                            icon={<InfoCircleOutlined />}
                            type="text"
                            style={{
                                color: "white",
                                fontSize: "20px",
                                marginLeft: "auto"
                            }}
                            onClick={handleDetails}/>
                    </Tooltip>
                    ) : null}
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