import React from 'react';
import 'styles/ui/Placeholder.css';
import {LoadingOutlined} from "@ant-design/icons";

const Placeholder = ({ loading = false, children, style = {} }) => {
    if (loading) {
        return (
            <div className="placeholder-loading" style={style}>
                {<LoadingOutlined/>} Загрузка...
            </div>
        );
    }

    return (
        <div className="placeholder" style={style}>
            {children}
        </div>
    );
};

export default Placeholder;