import * as express from "express";
import * as Api from "../api";

export const register = ( app: express.Application ) => {
    app.get("/startVodToLive", Api.serveManifest)
    app.get("/local/*", Api.localManifest)
    app.get("/remote/*", Api.remoteManifest)
}
