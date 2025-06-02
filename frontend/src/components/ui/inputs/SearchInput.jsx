import React, { useState } from 'react';
import { Input, Button, Form, Popover, Badge } from 'antd';
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import SelectGender from "components/ui/inputs/SelectGender.jsx";
import SelectFaculty from "components/ui/inputs/SelectFaculty.jsx";
import SelectCourse from "components/ui/inputs/SelectCourse.jsx";
import "styles/ui/SearchInput.css";

const SearchInput = ({ onSearch, initialFilter = {}, style= {} }) => {
    const [form] = Form.useForm();
    const [filter, setFilter] = useState({
        sex: initialFilter.sex || null,
        course: initialFilter.course || null,
        faculty: initialFilter.faculty || null
    });

    const hasFilters = !!(filter.sex || filter.course || filter.faculty);

    const handleSearch = (values) => {
        const keyword = values.keyword?.trim() || '';
        const cleanFilter = Object.fromEntries(
            Object.entries(filter).filter(([_, v]) => v != null && v !== '')
        );
        onSearch(keyword, cleanFilter);
    };

    return (
        <div className="search-input" style={style}>
            <Form
                form={form}
                style={{width: "100%", alignItems: "center"}}
                layout="inline"
                onFinish={handleSearch}
            >
                <Form.Item name="keyword" style={{ flex: 1 }}>
                    <Input
                        style={{borderRadius: "50px", flex: 1}}
                        size="large"
                        placeholder="Введите ключевое слово"
                        allowClear
                        onPressEnter={() => form.submit()} // Нажатие Enter
                    />
                </Form.Item>

                <Form.Item>
                    <Popover
                        title="Фильтры"
                        trigger="click"
                        placement="bottomRight"
                        content={
                            <Form layout="vertical" style={{ width: 250 }}>
                                <Form.Item label="Пол">
                                    <SelectGender
                                        value={filter.sex}
                                        onChange={(value) => setFilter(prev => ({ ...prev, sex: value }))}
                                    />
                                </Form.Item>

                                <Form.Item label="Курс">
                                    <SelectCourse
                                        value={filter.course}
                                        onChange={(value) => setFilter(prev => ({ ...prev, course: value }))}
                                    />
                                </Form.Item>

                                <Form.Item label="Факультет">
                                    <SelectFaculty
                                        value={filter.faculty}
                                        onChange={(value) => setFilter(prev => ({ ...prev, faculty: value }))}
                                    />
                                </Form.Item>
                            </Form>
                        }
                    >
                        <Badge dot={hasFilters}>
                            <Button size="large" icon={<FilterOutlined />} />
                        </Badge>
                    </Popover>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="circle"
                        size="large"
                        icon={<SearchOutlined />}
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export default SearchInput;
