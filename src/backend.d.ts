declare namespace Backend {
  interface Player {
    name: string;
  }

  interface Entry {
    typeRef: string;
    playerRef: string;
    date: Date;
  }

  interface Type {
    name: string;
    amount: number;
  }
}
