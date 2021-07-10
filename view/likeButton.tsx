import React, { Fragment, useCallback, useMemo, useReducer } from 'react';
import { createEpicMiddleware, ofType } from 'redux-observable';
import { delayWhen, EMPTY, mergeMap, Observable, Subject, tap } from 'rxjs';

interface State {
    x : number
}

enum Action {
    Plus,
    Minus
}

const refState: { state: State } = { 
    state: undefined as any
}

const renderBus = new Subject<State>()

const reducer = (state: State, action: { type: Action }) => {
    if(action.type === Action.Plus) {
        return { x: state.x+1 }
    } else {
        return { x: state.x-1 }
    }
}

const incrementIfOddEpic = (action$: Observable<{ type: Action }>) => {
    return action$.pipe(
        delayWhen(() => renderBus),
        ofType(Action.Plus),
        tap(() => {
            console.log('real')
            console.log(refState.state)
        }),
        mergeMap(() => EMPTY),
        // mapTo({ type: Action.Minus })
    )
}

export function LikeButton (props: { commentID: number, clientRender: boolean }){
    const rxReducer = useCallback((state: State, action: { type: Action }) => {
        const result = reducer(state, action)
        refState.state = result
        return result
    }, [])

    const [state, dispatch] = useReducer(rxReducer, undefined, () => ({ x: 1 }));

    const rxDispatch = useMemo(() => {
        refState.state = state
        const epicMiddleware = createEpicMiddleware()
        const storeFake: any = {
            getState: () => undefined,
            dispatch: dispatch.bind(dispatch)
        }
        const newDispatch: typeof dispatch = epicMiddleware(storeFake)(storeFake.dispatch) as any
        if(props.clientRender) {
            epicMiddleware.run(incrementIfOddEpic as any)
        }
        return newDispatch
    }, []);

    useMemo(() => {
        renderBus.next(state)
    }, [state])

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