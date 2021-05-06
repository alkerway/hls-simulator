import * as express from "express";
import * as Api from "../api";

export const register = ( app: express.Application ) => {
    app.post("/serveManifest", Api.serveManifest)
    app.get("/manifest/*", Api.staticManifest)
}
