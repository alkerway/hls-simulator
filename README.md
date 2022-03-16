# HLS Simulator

With this tool one can:
1. Create common failures (timeouts, stalls, etc) in frag or level requests 
1. Serve VOD manifests as live manifests

## Demo

![GUI gif](./demo.gif)

# Docs
## Running the App

The app's structure is API-based. One can use curl to perform requests, or use the GUI built in by requesting the `/` endpoint in a browser. This README will document the GUI functions and list the curl equivalents along the way.

To set up the app, clone the repo then run the following:

1. `npm install`
2. `npm run build`
3. `npm run start`

## Step 1: Starting a Session

Clicking `Start Session` will return a session Id and start the vod-to-live manifest timer. A manifest level request 60 seconds after the `startSession` call will return a manifest around 60 seconds long.

> Curl equivalent: `curl http://localhost:8880/startSession` will return the session start time in seconds, and a sessionId (e.g. "abc") to match the startTime and following messages (below).

Clicking `Reset Timer` will keep the session but reset the timer.

> Curl equivalent: `curl http://localhost:8880/startSession?sessionId=abc`


## Step 2: Constructing a live stream url

The app will work with an input of either a master or level manifest remote url. For live remote manifests, as well as vod manifests with the option `keepVod`, the session timer and dvr length are ignored and the app will function as a proxy that can simulate events. For vod remote manifests, by default, the app will generate a live stream based on the session timer.

To get a simulated live manifest url, enter a manifest url into the url input. The generated manifest url will be in the Generated Url field, and can be played in a video player.

> Curl equivalent: build the live stream url in the following manner:
>
> `http://<hls-simulator-server>/remote/level.m3u8?sessionId=<id>&url=<vod-level-manifest-url>`
> 
> An example of a vod level manifest and then a live generated manifest url, with a sessionId of `abc`
>
> `https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8` 
>
> `http://localhost:8880/remote/level.m3u8?sessionId=abc&url=https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8`


### Rolling Dvr

For vod, the Rolling Dvr Length option tells the server to start returning a rolling dvr level manifest once the vod-to-live manifest timer exceeds the specified number of seconds. A dvr length of 60 means the level returned will contain the minimum number of fragments that exceed 60 seconds of duration. If this parameter is not specified or not positive, the app will return a event-style playlist.

For live, the Rolling Dvr Length option tells the server to trim the live manifest to match the dvr window, if its length exceeds the specified window length.

> Curl equivalent: append `&dvrWindowSeconds=60` to the generated manifest url

### KeepVod

By default, given a vod manifest, the app will return a live manifest that updates according to the sesion timer. To return a vod manifest instead that mirrors the remote vod manifest, set the keepVod option. One can still simulate frag network events with this setup.

> Curl equivalent: append `&keepVod=true` to the generated manifest url

## Step 3: Simulate Events

The buttons in step 3 can all be clicked to simulate events. The events are listed below.


> Curl equivalent: `curl http://<hls-simulator-server>/deliver?sessionId=<id>&msg=<message-text>`
>
> Note: the messages are case sensitive

#### `NextFrag403`

The next frag request will get a 403 status and html page response; subsequent frag requests will return normally

#### `AllFrag403`

Any following frag request will get a 403 status and html page response

#### `NextFragTimeout`

The next frag request will time out without a response

#### `AllFragDelay`

Any following frag requests will be delayed a random number of seconds (between 1 and 20) before receiving a response.

#### `NextLevel403`

The next level manifest request will get a 403 status and html page response; subsequent level manifest requests will return normally

#### `AllLevel403`

Any following level manifest request will get a 403 status and html page response

#### `NextLevelTimeout`

The next level manifest request will time out without a response

#### `LevelStall`

Any following level requests will return the same level manifest as the last request before the message. The level manifest will not update with new frags, but will still return ok.

#### `StreamEnd`

The next level manifest will have an `#EXT-X-ENDLIST` tag appended to the end. Further level requests will receive the same manifest.

#### `Reset`

Any issues created by the above requests will go away. For example, if `AllFrag403` was called previously, a call to `Reset` means following fragment requests will no longer return a 403 response. If `LevelStall` or `StreamEnd` was called previously, the level will update according in line with the session timer (most likely jump ahead).
