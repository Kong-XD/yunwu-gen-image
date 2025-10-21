import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import './index.less';

interface UserType {
  key: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createTime: string;
}

const Users: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增用户');
  const [form] = Form.useForm();

  const columns: ColumnType<UserType>[] = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, { text: string; color: string }> = {
          admin: { text: '管理员', color: 'red' },
          user: { text: '普通用户', color: 'blue' },
          vip: { text: 'VIP用户', color: 'gold' },
        };
        const roleInfo = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: '正常', color: 'success' },
          inactive: { text: '禁用', color: 'error' },
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_: any, record: UserType) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource: UserType[] = [
    {
      key: '1',
      id: 'U001',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
      status: 'active',
      createTime: '2024-01-15 10:30',
    },
    {
      key: '2',
      id: 'U002',
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
      status: 'active',
      createTime: '2024-02-20 14:20',
    },
    {
      key: '3',
      id: 'U003',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'vip',
      status: 'active',
      createTime: '2024-03-10 09:15',
    },
    {
      key: '4',
      id: 'U004',
      name: '赵六',
      email: 'zhaoliu@example.com',
      role: 'user',
      status: 'inactive',
      createTime: '2024-04-05 16:45',
    },
  ];

  const handleAdd = () => {
    setModalTitle('新增用户');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: UserType) => {
    setModalTitle('编辑用户');
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: UserType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('表单值:', values);
      message.success(modalTitle === '新增用户' ? '添加成功' : '更新成功');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="users-page">
      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="vip">VIP用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;


