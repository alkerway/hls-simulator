# HLS Simulator

With this tool one can:
1. Serve VOD manifests as live manifests
1. Create common failures (timeouts, stalls, etc) in frag or level requests 

## How It Works

The process is API-based. One can use curl to perform requests. Currently it works with level manifests only, no masters. To set up the server, run the following:
1. `npm install`
2. `npm run build`
3. `cd dist`
4. `node index.js`

### Starting a Session

A call to `curl http://localhost:8880/startSession` will start the vod-to-live manifest timer. For instance, a manifest level request 20 seconds after the `startSession` call will return a manifest around 20 seconds long. The call to `startSession` will return the session start time in seconds, and a sessionId to match the startTime and following messages (below).

### Constructing a live stream url

A live stream url can be built in the following manner:

`http://<hls-simulator-server>/remote/level.m3u8?sessionId=<id>&url=<vod-level-manifest-url>`

For example, with a sessionId of `abc` and the test level manifest from the hls.js demo page (below):

`https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8` 

We can get our live stream by requesting `http://localhost:8880/remote/level.m3u8?sessionId=abc&url=https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8`

Playing the url in a video player will play a live manifest.

### Url Options

* The query parameter `&dvrWindowSeconds=60` tells the server to start returning a rolling dvr level manifest once the vod-to-live manifest timer exceeds 60 seconds. A dvr window of 60 means the level returned will contain the minimum number of fragments that exceed 60 seconds of duration. If this parameter is not specified, the app will return a event-style playlist.

## Simulate Events

The API can be used to create issues or simulate events using the format

`curl http://<hls-simulator-server>/deliver?sessionId=<id>&msg=<message-text>`

A full list of messages can be found by requesting the `/listMessages` endpoint. The current list is below and is case sensitive.

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
