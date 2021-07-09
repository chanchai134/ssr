import React, { Fragment, useMemo, useReducer } from 'react';
import { createEpicMiddleware, ofType, StateObservable } from 'redux-observable';
import { bufferTime, concatMap, delay, mapTo, mergeMap, Observable, of, tap } from 'rxjs';

interface State {
    x : number
}

enum Action {
    Plus,
    Minus
}

const reducer = (state: State, action: { type: Action }) => {
    if(action.type === Action.Plus) {
        return { x: state.x+1 }
    } else {
        console.log(new Date().toLocaleTimeString())
        return { x: state.x-1 }
    }
}

const incrementIfOddEpic = (action$: Observable<{ type: Action }>, state$: StateObservable<State>) => action$.pipe(
    ofType(Action.Plus),
    bufferTime(10000),
    tap(x => console.log(x.length)),
    mergeMap(x => x),
    concatMap(x => of(x).pipe(
        delay(1000)
    )),
    mapTo({ type: Action.Minus })
);

export function LikeButton (props: { commentID: number, clientRender: boolean }){
    const [state, dispatch] = useReducer(reducer, { x: 1 });
    const rxDispatch = useMemo(() => {
        const epicMiddleware = createEpicMiddleware();
        const storeFake: any = {
            getState: () => state,
            dispatch: dispatch.bind(dispatch)
        }
        const newDispatch: typeof dispatch = epicMiddleware(storeFake)(storeFake.dispatch) as any
        if(props.clientRender) {
            epicMiddleware.run(incrementIfOddEpic as any)
        }
        return newDispatch
    }, []);

    const x = () => { 
        rxDispatch({ type: Action.Plus })
    }

    const t = () => { 
        rxDispatch({ type: Action.Minus })
    }
    return (
        <Fragment>
            <b>POM {props.commentID} {state.x}</b>
            <br />
            <button onClick={x}>+</button>
            <button onClick={t}>-</button>
        </Fragment>
    )
}