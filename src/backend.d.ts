declare namespace Backend {
  interface Player {
    name: string;
  }

  interface EntryEntry {
    typeRef: firebase.firestore.DocumentReference<Backend.Type>;
    playerRef: firebase.firestore.DocumentReference<Backend.Player>;
  }

  interface Entry {
    entries: EntryEntry[];
    date: firebase.firestore.Timestamp;
  }

  interface Category {
    name: string;
    ordinal: number;
  }

  interface Type {
    name: string;
    amount: number;
  }
}
