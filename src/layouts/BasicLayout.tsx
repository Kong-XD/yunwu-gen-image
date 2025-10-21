import React from 'react';
import { Outlet } from 'umi';
import './BasicLayout.less';

const BasicLayout: React.FC = () => {
  return (
    <div className="basic-layout-fullscreen">
      <Outlet />
    </div>
  );
};

export default BasicLayout;


