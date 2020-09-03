import { Store } from "./Store";

class PlayerStore extends Store<Backend.Player> {}
export const playerStore = new PlayerStore();
