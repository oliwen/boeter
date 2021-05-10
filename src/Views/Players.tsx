import * as React from "react";
import { playerStore, entryStore, typesStore } from "../stores/stores";
import { WithId } from "../stores/Store";
import { Table } from "antd";
import { observer } from "mobx-react";
import moment from "moment";

type Entry = {
  date: firebase.firestore.Timestamp;
  amount: number;
  type: string;
};

export const Players: React.FC = observer(() => {
  const { data: players } = playerStore.useCollection("players");
  const { data: entries } = entryStore.useCollection("entries");

  const playersMap: {
    [key: string]: {
      player: WithId<Backend.Player>;
      entries: Entry[];
      amount: number;
    };
  } = {};

  entries.forEach((entry) => {
    entry.entries.forEach((entryEntry) => {
      const playerId = entryEntry.playerRef.id;
      const player = players.find((p) => p.id === playerId);
      const type = typesStore.getDocument(entryEntry.typeRef);

      if (!player) {
        return;
      }

      if (!playersMap[playerId]) {
        playersMap[playerId] = { player, entries: [], amount: 0 };
      }

      if (type) {
        playersMap[playerId].amount += type.data?.amount || 0;
        playersMap[playerId].entries.push({
          date: entry.date,
          amount: type.data?.amount || 0,
          type: type.data?.name ?? "",
        });
      }
    });
  });

  const playersWithScore = players.map((player) => {
    const playerEntries = playersMap[player.id];

    if (!playerEntries) {
      return { ...player, entries: [], amount: 0 };
    }

    return {
      ...player,
      entries: playerEntries.entries,
      amount: playerEntries.amount,
    };
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Böter",
      key: "entry",
      render: (_: unknown, player: WithId<Backend.Player>) => {
        return (playersMap[player.id]?.amount ?? 0) + " kr";
      },
    },
  ];

  const expandedRowRender = (
    record: WithId<Backend.Player> & { entries: Entry[]; amount: number }
  ) => {
    const entryColumn = [
      {
        title: "Datum",
        dataIndex: "date",
        key: "date",
        render: (_: unknown, entry: Entry) => {
          return moment(entry.date.toDate()).format("YYYY-MM-DD");
        },
      },
      {
        title: "Typ",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Böter",
        dataIndex: "amount",
        key: "amount",
      },
    ];

    return (
      <Table
        columns={entryColumn}
        dataSource={record.entries}
        pagination={false}
      />
    );
  };

  return (
    <Table
      pagination={false}
      dataSource={playersWithScore.sort((a, b) =>
        a.amount > b.amount ? -1 : 1
      )}
      expandable={{ expandedRowRender }}
      columns={columns}
    />
  );
});
