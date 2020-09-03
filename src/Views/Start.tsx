import * as React from "react";
import { observer } from "mobx-react";
import { Button, ButtonGroup, Table } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { playerStore } from "../stores/stores";
import { db } from "../firebaseSetup";

export const Start: React.FC = observer(() => {
  const { data: players } = playerStore.useCollection(
    "players",
    db.collection("players")
  );

  return (
    <div>
      <ButtonGroup>
        <Button fluid size="big" primary>
          NYA BÖTER
        </Button>
        <Button fluid size="big" as={Link} to="/players/add">
          NY SPELARE
        </Button>
      </ButtonGroup>
      <Table>
        <Table.Body>
          {players.map((p) => {
            return (
              <Table.Row key={p.id}>
                <Table.Cell>{p.name}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
});
