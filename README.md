# HLS Simulator

With this tool one can:

1. Create common failures (timeouts, stalls, etc) in frag or level requests ([jump to section](#http-incidents))
1. Serve VOD manifests as live manifests
1. Inject any text (ads) whenever ([jump to section](#inject-custom-text))

## Demo (outdated)

![GUI gif](./demo.gif)

# Docs

## Running the App

The app's structure is API-based. One can use curl to perform requests, or use the GUI built in by requesting the `/` endpoint in a browser. This README will document the GUI functions and list the curl equivalents along the way.

To set up the app, clone the repo then run the following:

1. `npm install`
2. `npm run dev`

NOTE: Node >=17 is needed for the app to work.

## 1: Starting a Session

Clicking `Start Session` will return a session Id and start the vod-to-live manifest timer. A manifest level request 60 seconds after the `startSession` call will return a manifest around 60 seconds long.

> Curl equivalent: `curl http://localhost:8880/startSession` will return the session start time in seconds, and a sessionId (e.g. "abc") to match the startTime and following messages (below).

Clicking `Reset Timer` will keep the session but reset the timer.

> Curl equivalent: `curl http://localhost:8880/startSession?sessionId=abc`

Adding a value in the input next to the `Reset Timer` button will offset the initial time of the timer by the value given, in seonds.

> Curl equivalent: `curl http://localhost:8880/startSession?sessionId=abc&offset=60`

## 2: Constructing a live stream url

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

For vod, the Rolling Dvr Length option tells the server to start returning a rolling dvr level manifest once the vod-to-live manifest timer exceeds the specified number of seconds. A dvr length of 60 means the level returned will be a maximnum of 60 seconds long. If this parameter is not specified or not positive, the app will return an event-style playlist.

For live, the Rolling Dvr Length option tells the server to trim the live manifest to match the dvr window, if its length exceeds the specified window length.

> Curl equivalent: append `&dvrWindowSeconds=60` to the generated manifest url

### KeepVod

By default, given a vod manifest, the app will return a live manifest that updates according to the sesion timer. To return a vod manifest instead that mirrors the remote vod manifest, set the keepVod option. One can still simulate frag network events and custom injections with this setup.

> Curl equivalent: append `&keepVod=true` to the generated manifest url

## 3: Simulate Events

### HTTP Incidents

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

### Inject Custom Text

Custom text can be injected into manifests to simulate ad breaks and content changes. This application cannot split up any fragments as they are hosted on their respective remote servers, so any text injected may alter the timings of the returned manifest. It is assumed that any custom text sent is an HLS Level manifest with or without header tags.

Inject a manifest by pasting text into the text area and clicking Send. See the sections below for more details on where the injected text will appear in relation to the original manifest.

> Curl equivalent:
>
> `curl -X POST -H "Content-Type: text/plain" --data-binary "@/path/to/ad.m3u8" "http://<hls-simulator-server>/inject?sessionId=gmh&startAfter=30"`
> The startAfter parameter maps to the time in the manifest for Vod to Vod and Vod to Live, and to the media sequence for Live to Live

To clear all injected texts, click the Clear button below the text area.

> Curl equivalent: `curl http://<hls-simulator-server>/clearInjections?sessionId=<id>`

#### How it works and Limitations: Vod to Vod and Vod to Live

The manifest time that custom text is injected can be set with the input above the text area. If the number in the input is negative, the value of the session timer at the time the custom text is sent will be used.

The server will inject the text at the point where the next fragment would be added to the manifest after the time sent with the injected text. For example, for a manifest with ten second fragments, if the custom text is injected at a time of 26.5, the server will return three ten second original fragments and then start adding the custom text.

If the total time of the injected text does not evenly match an integer number of fragments, the server will always add more time to the manifest and never take any time away. If custom text containing 3 fragments, each 4 seconds long, is injected at time 26.5 of a manifest with 10 second fragments, the manifest returned should be three original 10 second fragments (sequence numbers 0, 1, 2), the three injected fragments, then original fragments at sequence numbers 4, 5, etc. The original fragment number 3 will be replaced by the custom text. The manifest with injected text will be two seconds longer than the original manifest.

#### How it works and Limitations: Live to Live

Live to live means the remote manifest is live.

For live to live, timing of injected text is based on media sequence and not time. If no positive value is provided in the input above the text area, the next level request will set the media sequence on the injected text to be one greater than the greatest media sequence in the manifest. If a positive value is provided in the input above the text area, the first injected fragment will replace the original fragment at the media sequence matching the provided positive value.

For live to live, instead of trying to get the timing of the original and modified manifests to match each other, the original fragments are replaced one for one with the injected fragments. This may affect the timing of the manifest - if the original manifest is a rolling dvr window of 6 fragments at 10 seconds each, and the injected text is 3 fragments at 8 seconds each, when one fragment is replaced the manifest will be shorter by 2 seconds, when two fragments are replaced the manifest will be shorter by 4 seconds, etc.

---
