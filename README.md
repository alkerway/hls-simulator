# HLS Simulator

With this tool one can:
1. Serve VOD manifests as live manifests
1. Create common failures (timeouts, stalls, etc) in frag or level requests 

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

Clicking `Start Session` will start the vod-to-live manifest timer. A manifest level request 60 seconds after the `startSession` call will return a manifest around 60 seconds long.

> Curl equivalent: `curl http://localhost:8880/startSession` will return the session start time in seconds, and a sessionId (e.g. "abc") to match the startTime and following messages (below).

Clicking `Reset Timer` will keep the session but reset the timer.

> Curl equivalent: `curl http://localhost:8880/startSession?sessionId=abc`


## Step 2: Constructing a live stream url

Currently the app only works with level manifests only, no masters. 

To get a simulated live manifest url, input a vod level manifest into the url input. The generated live manifest url will be in the Generated Url field, and can be played in video players.

An example live level manifest is below:

`https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8` 


> Curl equivalent: build the live stream url in the following manner:
>
> `http://<hls-simulator-server>/remote/level.m3u8?sessionId=<id>&url=<vod-level-manifest-url>`
> 
> An example, with a sessionId of `abc` and the test level manifest mentioned:
>
> `http://localhost:8880/remote/level.m3u8?sessionId=abc&url=https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8`


### Rolling Dvr

The Rolling Dvr Length option tells the server to start returning a rolling dvr level manifest once the vod-to-live manifest timer exceeds the specified number of seconds. A dvr length of 60 means the level returned will contain the minimum number of fragments that exceed 60 seconds of duration. If this parameter is not specified or not positive, the app will return a event-style playlist.

> Curl equivalent: append `&dvrWindowSeconds=60` to the generated live stream url

## Step 3: Simulate Events

The buttons in step 3 can all be clicked to simulate events. The events are listed below.


> Curl equivalent: `curl http://<hls-simulator-server>/deliver?sessionId=<id>&msg=<message-text>`
>
> Note: the messages are case sensitive

#### `NextFrag403`

The next frag request will get a 403 status and html page response; frag requests after that will return normally

#### `AllFrag403`

Any following frag request will get a 403 status and html page response

#### `NextFragTimeout`

The next frag request will time out without a response

#### `AllFragDelay`

Any following frag requests will be delayed a random number of seconds (between 1 and 20) before receiving a response.

#### `NextLevel403`

The next level manifest request will get a 403 status and html page response; level manifest requests after that will return normally

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
