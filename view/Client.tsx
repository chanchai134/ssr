import React from 'react';
import ReactDOM from 'react-dom';
import { LikeButton } from './likeButton';

const domContainer = document.querySelector('#root');
ReactDOM.hydrate(<LikeButton commentID={(window as any).__INITIAL_STATE__} clientRender={true} />, domContainer)
