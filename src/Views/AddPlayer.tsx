import * as React from "react";
import { db } from "../firebaseSetup";
import { Form, Input, Button } from "antd";
import { useForm } from "antd/lib/form/Form";

export const AddPlayer: React.FC = () => {
  const [form] = useForm();

  const onFinish = async (values: Backend.Player) => {
    await db.collection("players").add(values);
    form.resetFields();
  };

  return (
    <div>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="name" label="Namn">
          <Input />
        </Form.Item>
        <Button htmlType="submit">SPARA SPELARE</Button>
      </Form>
    </div>
  );
};
