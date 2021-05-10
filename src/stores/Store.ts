import { decorate, observable, action, computed } from "mobx";
import firebase from "firebase/app";

export type WithId<T> = T & { id: string; key: string };

export class StoreItem<T> {
  public error?: Error;

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
      this.docRef.onSnapshot(this.handleUpdate, (error) =>
        console.error("onDocSnapshot", error)
      );
    }
  };

  handleUpdate = async (
    documentSnapshot: firebase.firestore.DocumentSnapshot
  ) => {
    if (documentSnapshot.exists) {
      this.data = {
        ...(documentSnapshot.data() as T),
        key: documentSnapshot.id,
        id: documentSnapshot.id,
      };
    } else {
      this.data = undefined;
      this.error = new Error("NOT_FOUND");
    }
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
      this.query.onSnapshot(this.handleDataUpdate, (error) =>
        console.error("onCollectionSnapshot", error)
      );
    }
  };

  handleDataUpdate = (querySnapshot: firebase.firestore.QuerySnapshot) => {
    if (!querySnapshot?.docs) {
      return;
    }

    this.data = querySnapshot.docs.map((documentSnapshot) => {
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

      return this.parentStore.items.get(documentSnapshot.id) as StoreItem<T>;
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

export class Store<T extends firebase.firestore.DocumentData> {
  queries = observable.map<string, StoreItems<T>>();
  items = observable.map<string, StoreItem<T>>();

  constructor(public collection: firebase.firestore.CollectionReference) {}

  doc(id: string) {
    return this.collection.doc(id);
  }

  withCollection<T2>(
    func: (collection: firebase.firestore.CollectionReference) => T2
  ) {
    return func(this.collection);
  }

  set(
    id: string,
    data: Partial<T>,
    parentRef?: firebase.firestore.DocumentReference
  ) {
    if (parentRef) {
      return parentRef
        .collection(this.collection.path)
        .doc(id)
        .set(data, { merge: true });
    }

    return this.collection.doc(id).set(data, { merge: true });
  }

  add(data: T, parentRef?: firebase.firestore.DocumentReference) {
    if (parentRef) {
      return parentRef.collection(this.collection.path).add(data);
    }

    return this.collection.add(data);
  }

  update(
    id: string,
    data: T,
    parentRef?: firebase.firestore.DocumentReference
  ) {
    if (parentRef) {
      return parentRef.collection(this.collection.path).doc(id).update(data);
    }

    return this.collection.doc(id).update(data);
  }

  addOrUpdate(
    maybeId: string | undefined,
    data: T,
    parentRef?: firebase.firestore.DocumentReference
  ) {
    const id =
      maybeId ||
      (parentRef
        ? parentRef.collection(this.collection.path)
        : this.collection
      ).doc().id;

    return this.set(id, data, parentRef);
  }

  delete(id: string, parentRef?: firebase.firestore.DocumentReference) {
    if (parentRef) {
      return parentRef.collection(this.collection.path).doc(id).delete();
    }

    return this.collection.doc(id).delete();
  }

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
    const cachedItemKey = docRef.path + (options?.once ? "-once" : "");
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
    getQuery?: (
      collection: firebase.firestore.CollectionReference
    ) => firebase.firestore.Query | undefined,
    options?: Options
  ): { data: WithId<T>[]; loading: boolean; error: boolean; isReady: boolean } {
    const query = getQuery ? getQuery(this.collection) : this.collection;

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
    getDocRef: (
      collection: firebase.firestore.CollectionReference
    ) => firebase.firestore.DocumentReference | undefined,
    options?: Options
  ) {
    const docRef = getDocRef(this.collection);
    if (!docRef || options?.skip) {
      return {
        data: undefined,
        loading: false,
        error: false,
      };
    }

    const storeItem = this.getDocument(docRef, options);

    return storeItem;
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
