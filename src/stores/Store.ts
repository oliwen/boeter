import { decorate, observable, action, computed } from "mobx";

export type WithId<T> = T & { id: string; key: string };

export class StoreItem<T> {
  constructor(
    protected parentStore: Store<T>,
    public docRef: firebase.firestore.DocumentReference,
    public data?: WithId<T>,
    public loading: boolean = true,
    public once: boolean = false
  ) {
    this.setup();
  }

  setup = async () => {
    if (this.once) {
      const doc = await this.docRef.get();
      this.handleUpdate(doc);
    } else {
      this.docRef.onSnapshot(this.handleUpdate);
    }
  };

  handleUpdate = async (
    documentSnapshot: firebase.firestore.DocumentSnapshot
  ) => {
    this.data = {
      ...(documentSnapshot.data() as T),
      key: documentSnapshot.id,
      id: documentSnapshot.id,
    };
    this.setLoading(false);
  };

  setLoading(loading: boolean) {
    this.loading = loading;
  }
}

export class StoreItems<T> {
  constructor(
    protected parentStore: Store<T>,
    public query: firebase.firestore.Query,
    public data: StoreItem<T>[] = [],
    public loading: boolean = true,
    public once: boolean = false
  ) {
    this.setup();
  }

  setup = async () => {
    if (this.once) {
      const data = await this.query.get();
      this.handleDataUpdate(data);
    } else {
      this.query.onSnapshot(this.handleDataUpdate);
    }
  };

  handleDataUpdate = (querySnapshot: firebase.firestore.QuerySnapshot) => {
    this.data = (querySnapshot?.docs || []).map((documentSnapshot) => {
      const item = this.parentStore.items.get(documentSnapshot.id);
      if (item) {
        item.data = {
          ...(documentSnapshot.data() as T),
          key: documentSnapshot.id,
          id: documentSnapshot.id,
        };
      } else {
        this.parentStore.items.set(
          documentSnapshot.id,
          new StoreItem(this.parentStore, documentSnapshot.ref, {
            ...(documentSnapshot.data() as T),
            key: documentSnapshot.id,
            id: documentSnapshot.id,
          })
        );
      }

      return this.parentStore.items.get(documentSnapshot.id) as StoreItem<
        WithId<T>
      >;
    });

    this.setLoading(false);
  };

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  get dataItems(): WithId<T>[] {
    return this.data.map((item) => item.data).filter((i) => !!i) as WithId<T>[];
  }
}

interface Options {
  skip?: boolean;
  once?: boolean;
}

export class Store<T> {
  queries = observable.map<string, StoreItems<T>>();
  items = observable.map<string, StoreItem<T>>();

  getCollection(
    key: string,
    query: firebase.firestore.Query,
    options?: Options
  ) {
    const cachedQueryKey = key + (options?.once ? "-once" : "");

    let cachedQuery = this.queries.get(cachedQueryKey);
    if (cachedQuery) {
      return cachedQuery;
    }

    const newStoreItem = new StoreItems<T>(
      this,
      query,
      undefined,
      undefined,
      options?.once
    );
    this.queries.set(cachedQueryKey, newStoreItem);

    return newStoreItem;
  }

  getDocument(docRef: firebase.firestore.DocumentReference, options?: Options) {
    const cachedItemKey = docRef.id + (options?.once ? "-once" : "");
    const cachedItem = this.items.get(cachedItemKey);
    if (cachedItem) {
      return cachedItem;
    }

    const newStoreItem = new StoreItem<T>(
      this,
      docRef,
      undefined,
      undefined,
      options?.once
    );
    this.items.set(cachedItemKey, newStoreItem);

    return newStoreItem;
  }

  useCollection(
    key: string,
    query?: firebase.firestore.Query,
    options?: Options
  ): { data: WithId<T>[]; loading: boolean; error: boolean; isReady: boolean } {
    if (!query || options?.skip) {
      return { data: [], loading: true, error: false, isReady: false };
    }

    const storeItem = this.getCollection(key, query, options);

    const dataItems = storeItem.dataItems;

    return {
      data: dataItems,
      loading: storeItem.loading,
      error: false,
      isReady: !!dataItems && !storeItem.loading,
    };
  }

  useDocument(
    docRef?: firebase.firestore.DocumentReference,
    options?: Options
  ) {
    if (!docRef || options?.skip) {
      return {
        data: undefined,
        loading: false,
        error: false,
      };
    }

    const storeItem = this.getDocument(docRef, options);

    return {
      data: storeItem.data,
      loading: storeItem.loading,
      isReady: storeItem.data && !storeItem.loading,
    };
  }
}

decorate(StoreItems, {
  data: observable,
  loading: observable,
  setLoading: action,
  dataItems: computed.struct,
});

decorate(StoreItem, {
  data: observable,
  loading: observable,
  setLoading: action,
});
