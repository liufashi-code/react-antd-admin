import React, { useState } from 'react';
import { Table, Card, Button, Popconfirm, Modal, message, Form, Input } from 'antd';
import { useAntdTable, useRequest } from 'ahooks';
import {
  usherQueryParamGet,
  usherQueryParamDelete,
  usherQueryParamUpdate,
  usherQueryParamAdd,
} from '@/services';

const InParameterConfig = ({ onConfigChange, methodId }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [updateId, setUpdateId] = useState();

  // 获取表格数据
  const { tableProps, run: runQuery } = useAntdTable(
    () =>
      usherQueryParamGet(methodId).then(res => ({
        list: res?.data,
      })),
    {
      onSuccess: ({ list }) => {
        onConfigChange(list);
      },
    }
  );

  // 更新添加
  const { loading: confirmLoading, run: runAddOrUpdate } = useRequest(
    options => (updateId ? usherQueryParamUpdate(options) : usherQueryParamAdd(options)),
    {
      manual: true,
      onSuccess: () => {
        message.success(updateId ? '更新成功' : '添加成功');
        setVisible(false);
        runQuery();
      },
    }
  );

  // 删除
  const { loading: deleteConfirmLoading, runAsync: runAsyncDelete } = useRequest(
    paramId => usherQueryParamDelete(paramId),
    { manual: true }
  );

  //提交修改/更新
  const onFinish = values => {
    runAddOrUpdate({ ...values, methodId, paramId: updateId });
  };
  const columns = [
    {
      title: '序号',
      render: (_, record, index) => {
        return index + 1;
      },
    },
    {
      title: '接口需要参数',
      dataIndex: 'paramName',
    },
    {
      title: '获取规则',
      dataIndex: 'paramValue',
    },
    {
      title: '操作',
      dataIndex: 'paramId',
      render: (paramId, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setVisible(true);
              form.setFieldsValue(record);
              setUpdateId(paramId);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() =>
              runAsyncDelete(paramId).then(res => {
                if (res.success) {
                  message.success('删除成功');
                  runQuery();
                }
              })
            }
            okButtonProps={{ loading: deleteConfirmLoading }}
          >
            <Button type="link" style={{ marginLeft: 8 }}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <>
      <Card
        size="small"
        title={
          <div className="global-cardTitle">
            <div>入参列表</div>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setVisible(true);
                form.resetFields();
                setUpdateId();
              }}
            >
              添加
            </Button>
          </div>
        }
      >
        <Table rowKey="paramId" columns={columns} {...tableProps} />
      </Card>
      <Modal
        visible={visible}
        title={updateId ? '更新配置' : '添加配置'}
        confirmLoading={confirmLoading}
        onCancel={() => setVisible(false)}
        onOk={form.submit}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
          form={form}
          validateMessages={{ required: '${label}不能为空' }}
          onFinish={onFinish}
        >
          <Form.Item rules={[{ required: true }]} label="需要参数" name="paramName">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label="获取规则" name="paramValue">
            <Input placeholder="请输入" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InParameterConfig;
