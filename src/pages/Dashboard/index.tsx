import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import './index.less';

const Dashboard: React.FC = () => {
  const statisticsData = [
    {
      title: '总用户数',
      value: 11280,
      icon: <UserOutlined />,
      color: '#1890ff',
    },
    {
      title: '总订单数',
      value: 8432,
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
    },
    {
      title: '总收入',
      value: 93264,
      prefix: '¥',
      icon: <DollarOutlined />,
      color: '#faad14',
    },
    {
      title: '增长率',
      value: 32.8,
      suffix: '%',
      icon: <RiseOutlined />,
      color: '#f5222d',
    },
  ];

  const recentOrdersColumns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => `¥${text}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待处理', color: '#faad14' },
          processing: { text: '处理中', color: '#1890ff' },
          completed: { text: '已完成', color: '#52c41a' },
        };
        const status = statusMap[text] || { text, color: '#666' };
        return <span style={{ color: status.color }}>{status.text}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  const recentOrdersData = [
    {
      key: '1',
      orderNo: 'ORD20231001001',
      userName: '张三',
      amount: 299,
      status: 'completed',
      createTime: '2024-10-20 10:30',
    },
    {
      key: '2',
      orderNo: 'ORD20231001002',
      userName: '李四',
      amount: 599,
      status: 'processing',
      createTime: '2024-10-20 11:20',
    },
    {
      key: '3',
      orderNo: 'ORD20231001003',
      userName: '王五',
      amount: 899,
      status: 'pending',
      createTime: '2024-10-20 12:15',
    },
    {
      key: '4',
      orderNo: 'ORD20231001004',
      userName: '赵六',
      amount: 1299,
      status: 'completed',
      createTime: '2024-10-20 13:45',
    },
  ];

  return (
    <div className="dashboard-page">
      <h2 className="page-title">数据概览</h2>
      
      <Row gutter={16} className="statistics-row">
        {statisticsData.map((item, index) => (
          <Col span={6} key={index}>
            <Card className="statistic-card">
              <div className="statistic-icon" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="最近订单" className="recent-orders-card">
        <Table
          columns={recentOrdersColumns}
          dataSource={recentOrdersData}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;


