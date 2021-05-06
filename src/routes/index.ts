import * as express from 'express';
import * as Api from '../api';

export const register = ( app: express.Application ) => {
    app.get('/startSession', Api.startLiveManifest)
    app.get('/remote/*', Api.remoteManifest)
    app.get('/deliver', Api.deliver)
    app.get('/listMessages', Api.listMessages)
}
