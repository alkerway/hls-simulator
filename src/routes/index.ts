import * as express from "express";
import * as Api from "../api";

export const register = ( app: express.Application ) => {
    app.get("/startVodToLive", Api.startLiveManifest)
    // app.get("/local/*", Api.localManifest)
    app.get("/remote/*", Api.remoteManifest)
    app.get("/deliver", Api.deliver)
    app.get("/listMessages", Api.listMessages)
}
