import React, { Fragment } from 'react';

export function Vtt () {
    return (
        <Fragment>
            <video controls src="/amp4">
                <track default src="avtt" />
            </video>
        </Fragment>
    )
}