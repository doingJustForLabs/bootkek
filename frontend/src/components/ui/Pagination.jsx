import React from 'react';
import {Button} from "antd";
import { RightOutlined, LeftOutlined, EllipsisOutlined } from "@ant-design/icons";
import "styles/ui/Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange, style= {} }) => {
    const generatePages = () => {
        const pages = [];

        const delta = 2; // количество соседей по бокам
        const range = [];

        for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
            range.push(i);
        }

        if (range[0] > 1) {
            if (range[0] !== 2) {
                range.unshift('...');
            }
            range.unshift(1);
        }

        if (range[range.length - 1] < totalPages) {
            if (range[range.length - 1] !== totalPages - 1) {
                range.push('...');
            }
            range.push(totalPages);
        }

        return range;
    };

    const pages = generatePages();

    return (
        <div className="pagination" style={{style}}>
            <Button icon={<LeftOutlined style={{color: (currentPage === 1 ? "#919191" : "#f4f4f4"), fontSize: "22px"}}/>} shape="circle" type="text" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}/>

            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={index} style={{color: "#f4f4f4"}}><EllipsisOutlined /></span>
                ) : (
                    <Button
                        key={index}
                        shape="circle"
                        type={page === currentPage ? 'default' : 'outline'}
                        onClick={() => onPageChange(page)}
                        style={{color: (page === currentPage ? "black" : "#f4f4f4"), fontSize: "18px"}}
                    >
                        {page}
                    </Button>
                )
            )}

            <Button icon={<RightOutlined style={{color: (currentPage === totalPages ? "#cccccc" : "#f4f4f4"), fontSize: "22px"}}/>} shape="circle" type="text" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}/>
        </div>
    );
};

export default Pagination;
