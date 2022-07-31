import { useMemo, useContext, useRef, ReactNode, createContext } from "react";
// useSyncExternalStore
import { useSubscription } from "use-subscription";

type CallbackSetState<T> = (prev: T) => T;

export type Store<T> = {
    getState: () => T;
    setState: (action: T | CallbackSetState<T>) => void;
    subscribe: (callback: () => void) => void;
};

export const createStore = <T extends unknown>(initialState: T): Store<T> => {
    let state = initialState;

    const callbacks = new Set<() => void>();
    const getState = () => state;
    const setState = (nextState: T | CallbackSetState<T>) => {
        state =
            typeof nextState === "function"
                ? (nextState as CallbackSetState<T>)(state)
                : nextState;
        callbacks.forEach((cb) => cb());
    };
    const subscribe = (callback: () => void) => {
        callbacks.add(callback);
        return () => {
            callbacks.delete(callback);
        };
    };

    return { getState, setState, subscribe };
};

type State = {
    count: number;
    text?: string;
};

const StoreContext = createContext<Store<State>>(
    createStore<State>({ count: 0, text: "hello" })
);

const StoreProvider = ({
    initialState,
    children,
}: {
    initialState: State;
    children: ReactNode;
}) => {
    const storeRef = useRef<Store<State>>();

    if (!storeRef.current) {
        storeRef.current = createStore(initialState);
    }

    return (
        <StoreContext.Provider value={storeRef.current}>
            {children}
        </StoreContext.Provider>
    );
};

const useSelector = <S extends unknown>(selector: (state: State) => S) => {
    const store = useContext(StoreContext);
    return useSubscription(
        useMemo(
            {
                getCurrentValue: () => selector(store.getState()),
                subscribe: store.subscribe,
            },
            [store, selector]
        )
    );
};

const useSetState = () => {
    const store = useContext(StoreContext);
    return store.setState;
};
