import cors from "cors"
import express from "express"
import * as routes from "./api/routes";

const app = express()
const port = 8880

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
    next()
});

app.use(express.text())
app.use(express.json())

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    // application specific logging, throwing an error, or other logic here
});

app.use(express.static('./src/gui'))
routes.register( app )
app.use(cors())
// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
