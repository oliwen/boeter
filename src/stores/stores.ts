import { Store } from "./Store";
import firebase from "firebase/app";

export const playerStore = new Store<Backend.Player>(
  firebase.firestore().collection("players")
);
export const entryStore = new Store<Backend.Entry>(
  firebase.firestore().collection("entries")
);
export const categoryStore = new Store<Backend.Category>(
  firebase.firestore().collection("categories")
);
export const typesStore = new Store<Backend.Type>(
  firebase.firestore().collection("types")
);
