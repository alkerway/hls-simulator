# HLS Simulator

With this tool one can:
1. Serve VOD manifests as live manifests
1. Create common failures (timeouts, stalls, etc) in frag or level requests 

## How It Works

The process is API-based. It is easy to use curl to perform requests. Currently it works with level manifests only, no masters.

### Starting a Session

A call to `curl http://localhost:8880/startSession` will start the vod-to-live manifest timer. For instance, a manifest level request 20 seconds after the `startSession` call will return a manifest around 20 seconds long.

### Constructing a live stream url

A live stream url can be built in the following manner:

`http://<hls-simulator-server>/remote/level.m3u8?url=<vod-level-manifest-url>`

For example, using the test level manifest from the hls.js demo page (below):

`https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8` 

We can get our live stream by requesting `http://localhost:8880/remote/level.m3u8?url=https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8`

Playing the url in a video player will play a live manifest.

## Creating Problems

The API can be used to create issues using the format

`curl http://<hls-simulator-server>/deliver?msg=<message-text>`

A full list of messages can be found by requesting the `/listMessages` endpoint. The current list is below, extending it should be pretty easy.

#### `NextFrag403`

The next frag request will get a 403 status and html page response; frag requests after that will return normally

#### `AllFrag403`

Any following frag request will get a 403 status and html page response

#### `NextFragTimeout`

The next frag request will time out without a response

#### `NextLevel403`

The next level manifest request will get a 403 status and html page response; level manifest requests after that will return normally

#### `AllLevel403`

Any following level manifest request will get a 403 status and html page response

#### `NextLevelTimeout`

The next level manifest request will time out without a response

#### `LevelStall`

Any following level requests will return the same level manifest as the last request before the message. This essentially means the level manifest will not update with new frags, but will still return ok.

#### `Reset`

Any issues created by the above requests will go away. For example, if `AllFrag403` was called previously, a call to `Reset` means following fragment requests will no longer return a 403 response. If `LevelStall` was called previously, the level will update according in line with the session timer (most likely jump ahead).
