import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex } from 'antd';

const NewProfileCreation = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[url(/assets/muctr-bg.png)]">
        <div className="flex-col justify-self-start w-full max-w-sm p-8 rounded-4xl bg-white shadow-md">
            <img className="w-3/5 m-6" src="/assets/muctr-logo.png" alt="РХТУ-лого" />
          {children}
        </div>
      </div>
    );
};

export default NewProfileCreation;