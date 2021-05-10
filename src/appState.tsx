import * as firebase from "firebase/app";
import { action, decorate, observable } from "mobx";

class AppState {
  user?: firebase.User;

  constructor() {
    firebase.auth().onAuthStateChanged((user) => {
      this.setUser(user ?? undefined);
    });
  }

  setUser(user?: firebase.User) {
    console.log("*** user", user);
    this.user = user;
  }
}

decorate(AppState, {
  user: observable,
  setUser: action,
});

export const appState = new AppState();
