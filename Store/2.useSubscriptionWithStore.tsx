import { useCallback, useMemo } from "react";
import { useSubscription } from "use-subscription";
import { Store, createStore } from "./utils";

const useStoreSelector = <T, S>(store: Store<T>, selector: (state: T) => S) =>
    useSubscription(
        useMemo(
            () => ({
                getCurrentValue: () => selector(store.getState()),
                subscript: store.subscribe,
            }),
            [store, selector]
        )
    );

const store = createStore({ count1: 0, count2: 0 });

const Component1 = () => {
    const state = useStoreSelector(
        store,
        useCallback((state) => state.count1, [])
    );
    /*
    const state = useSubscription(useMemo(() => ({            
        getCurrentValue: () => store.getState().count1,        
        subscribe: store.subscribe,                            
    }), []));                                           
    */
    const inc = () => {
        store.setState((prev) => ({
            ...prev,
            count1: prev.count1 + 1,
        }));
    };
    return (
        <div>
            count1: {state} <button onClick={inc}>+1</button>
        </div>
    );
};
