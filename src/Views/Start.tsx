import * as React from "react";
import { observer } from "mobx-react";
import {
  playerStore,
  categoryStore,
  typesStore,
  entryStore,
} from "../stores/stores";
import { Form, DatePicker, Button, Card, Table, Switch, Select } from "antd";
import { WithId } from "../stores/Store";
import moment from "moment";
import { ColumnsType } from "antd/lib/table";
import * as firebase from "firebase/app";

type FormValues = {
  date: moment.Moment;
  players: { [key: string]: { [key: string]: boolean | undefined } };
};

export const Start: React.FC = observer(() => {
  const [form] = Form.useForm();
  const [category, setCategory] = React.useState<string | undefined>();
  const { data: players, loading: playersLoading } = playerStore.useCollection(
    "players"
  );
  const { data: categories } = categoryStore.useCollection("categories");

  const { data: types } = typesStore.useCollection(
    "types" + category,
    (collection) =>
      category
        ? collection.where(
            "categoryRef",
            "==",
            categoryStore.collection.doc(category)
          )
        : undefined
  );

  const onFinish = (values: FormValues) => {
    form.resetFields();

    const entries: Backend.Entry["entries"] = [];
    Object.keys(values.players).forEach((playerId) => {
      const playerEntry = values.players[playerId];
      if (playerEntry) {
        Object.keys(playerEntry).forEach((typeId) => {
          const typeValue = playerEntry[typeId];
          if (typeValue) {
            entries.push({
              typeRef: typesStore.collection.doc(typeId) as any,
              playerRef: playerStore.collection.doc(playerId) as any,
            });
          }
        });
      }
    });

    entryStore.add({
      entries,
      date: firebase.firestore.Timestamp.fromDate(values.date.toDate()),
    });
  };

  const onCategoryChange = (value: any) => {
    setCategory(value);
  };

  const columns = React.useMemo(() => {
    const columns: ColumnsType<WithId<Backend.Player>> = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
    ];

    types
      .sort((a, b) => (a.amount > b.amount ? 1 : -1))
      .forEach((type) => {
        columns.push({
          title: type.name + " (" + type.amount + " kr)",
          key: type.id,
          render: (_: unknown, player: WithId<Backend.Player>) => {
            return (
              <Form.Item
                name={["players", player.id, type.id]}
                valuePropName={"checked"}
              >
                <Switch />
              </Form.Item>
            );
          },
        });
      });

    return columns;
  }, [types]);

  return (
    <div>
      <Card>
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            date: moment(),
            players: {},
          }}
        >
          <Form.Item
            name="date"
            label="Datum"
            rules={[{ required: true, message: "Välj ett datum" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="category"
            label="Typ av tillfälle"
            rules={[{ required: true, message: "Välj ett tillfälle" }]}
          >
            <Select onChange={onCategoryChange}>
              {categories
                .sort((a, b) => (a.ordinal > b.ordinal ? 1 : -1))
                .map((c) => (
                  <Select.Option key={c.key} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Table
            pagination={false}
            loading={playersLoading}
            dataSource={players.sort((a, b) => (a.name > b.name ? 1 : -1))}
            columns={columns}
          />
          <Button style={{ marginTop: 20 }} htmlType="submit">
            SPARA BÖTER
          </Button>
        </Form>
      </Card>
    </div>
  );
});
