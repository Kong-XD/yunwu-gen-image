import React from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Divider } from 'antd';
import './index.less';

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('表单值:', values);
    message.success('保存成功');
  };

  return (
    <div className="settings-page">
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteName: '云雾后台管理系统',
            siteDescription: '一个基于Umi和Ant Design的后台管理系统',
            enableRegister: true,
            enableEmail: false,
            pageSize: '10',
            language: 'zh-CN',
          }}
        >
          <Divider orientation="left">基本设置</Divider>
          
          <Form.Item
            name="siteName"
            label="站点名称"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input placeholder="请输入站点名称" />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="站点描述"
            rules={[{ required: true, message: '请输入站点描述' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入站点描述"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item name="language" label="默认语言">
            <Select>
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="en-US">English</Select.Option>
              <Select.Option value="ja-JP">日本語</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">功能设置</Divider>

          <Form.Item
            name="enableRegister"
            label="开启用户注册"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableEmail"
            label="开启邮件通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="pageSize" label="每页显示数量">
            <Select>
              <Select.Option value="10">10条/页</Select.Option>
              <Select.Option value="20">20条/页</Select.Option>
              <Select.Option value="50">50条/页</Select.Option>
              <Select.Option value="100">100条/页</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">安全设置</Divider>

          <Form.Item
            name="maxLoginAttempts"
            label="最大登录尝试次数"
            rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
            initialValue={5}
          >
            <Input type="number" min={1} max={10} />
          </Form.Item>

          <Form.Item
            name="sessionTimeout"
            label="会话超时时间（分钟）"
            rules={[{ required: true, message: '请输入会话超时时间' }]}
            initialValue={30}
          >
            <Input type="number" min={5} max={1440} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              保存设置
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              onClick={() => form.resetFields()}
              size="large"
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;


