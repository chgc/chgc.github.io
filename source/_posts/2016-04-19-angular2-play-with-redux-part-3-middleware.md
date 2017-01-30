---
layout: post
title: '[Angular] play with Redux part 3 - middleware'
date: 2016-04-19 03:17
comments: true
categories: "Angular"
tag: "Angular2"
---
Redux2的middleware是介於action和reducer之間。例如: ReduxThunk.
設定方式是在建立store時，將middleware指定給store即可

寫自訂的middleware基本架構如下
```js
import isPromise from '../utils/is-promise';

export default function promiseMiddleware({ dispatch }) {
    return next => action => {
        if (!isPromise(action.payload)) {
            return next(action);
        }

        const { types, payload, meta } = action;
        const { promise, data } = payload;
        const [PENDING, FULFILLED, REJECTED] = types;

        /**
         * Dispatch the pending action
         */
        let pendingAction = { type: PENDING, payload: null, meta: null };
        if (_.isEmpty(data)) {
            pendingAction.payload = data;
        }
        if (_.isEmpty(meta)) {
            pendingAction.meta = meta;
        }
        dispatch(pendingAction);


        /**
         * If successful, dispatch the fulfilled action, otherwise dispatch
         * rejected action.
         */
        return promise.then(
            result => {
                dispatch({
                    type: FULFILLED,
                    payload: result,
                    meta,
                });
            },
            error => {
                dispatch({
                    type: REJECTED,
                    payload: error,
                    meta,
                });
            }
        );
    };
}
```

store的設定方式如下
```js
function configureStore(initialState) {
    const store = compose(
        _getMiddleware()
    )(createStore)(rootReducer, initialState);

    return store;
}

function _getMiddleware() {
    // 這裡加入middleware
    let middleware = [
        promiseMiddleware,
        ReduxThunk
    ];

    if (__DEV__) {
        middleware = [...middleware];
    }

    return applyMiddleware(...middleware);
}
```

參考文件:
    - [middleware](http://redux.js.org/docs/advanced/Middleware.html)
    - [redux-thunk](https://github.com/gaearon/redux-thunk)
