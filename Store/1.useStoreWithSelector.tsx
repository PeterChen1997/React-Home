import { useCallback, useEffect, useState } from "react";
import { Store, createStore } from "./utils";

const useStoreSelector = <T, S>(store: Store<T>, selector: (state: T) => S) => {
    const [state, setState] = useState(() => selector(store.getState()));

    const refreshState = useCallback(() => {
        setState(selector(store.getState()));
    }, [store, selector]);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            refreshState();
        });
        refreshState();
        return unsubscribe;
    }, [store, refreshState]);

    return state;
};

const store = createStore({ count1: 0, count2: 0 });
