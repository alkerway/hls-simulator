export const remoteMaster = `#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,NAME="720"
url_0/193039199_mp4_h264_aac_hd_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=246440,CODECS="mp4a.40.5,avc1.42000d",RESOLUTION=320x184,NAME="240"
url_2/193039199_mp4_h264_aac_ld_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=460560,CODECS="mp4a.40.5,avc1.420016",RESOLUTION=512x288,NAME="380"
url_4/193039199_mp4_h264_aac_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=836280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=848x480,NAME="480"
url_6/193039199_mp4_h264_aac_hq_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=6221600,CODECS="mp4a.40.2,avc1.640028",RESOLUTION=1920x1080,NAME="1080"
url_8/193039199_mp4_h264_aac_fhd_7.m3u8
`

export const proxyMaster = `#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,NAME="720"
level_0?sessionId=9FY&url=https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=246440,CODECS="mp4a.40.5,avc1.42000d",RESOLUTION=320x184,NAME="240"
level_1?sessionId=9FY&url=https://test-streams.mux.dev/x36xhzz/url_2/193039199_mp4_h264_aac_ld_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=460560,CODECS="mp4a.40.5,avc1.420016",RESOLUTION=512x288,NAME="380"
level_2?sessionId=9FY&url=https://test-streams.mux.dev/x36xhzz/url_4/193039199_mp4_h264_aac_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=836280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=848x480,NAME="480"
level_3?sessionId=9FY&url=https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=6221600,CODECS="mp4a.40.2,avc1.640028",RESOLUTION=1920x1080,NAME="1080"
level_4?sessionId=9FY&url=https://test-streams.mux.dev/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8
`

export const remoteVodLevelAES = `#EXTM3U
#EXT-X-VERSION:1
## Created with Unified Streaming Platform(version=1.6.7)
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-ALLOW-CACHE:NO
#EXT-X-TARGETDURATION:11
#EXT-X-KEY:METHOD=AES-128,URI="oceans.key"
#EXTINF:11, no desc
oceans_aes-audio=65000-video=236000-1.ts
#EXTINF:7, no desc
oceans_aes-audio=65000-video=236000-2.ts
#EXTINF:7, no desc
oceans_aes-audio=65000-video=236000-3.ts
#EXTINF:8, no desc
oceans_aes-audio=65000-video=236000-4.ts
#EXTINF:10, no desc
oceans_aes-audio=65000-video=236000-5.ts
#EXTINF:6, no desc
oceans_aes-audio=65000-video=236000-6.ts
#EXTINF:9, no desc
oceans_aes-audio=65000-video=236000-7.ts
#EXTINF:7, no desc
oceans_aes-audio=65000-video=236000-8.ts
#EXTINF:9, no desc
oceans_aes-audio=65000-video=236000-9.ts
#EXTINF:8, no desc
oceans_aes-audio=65000-video=236000-10.ts
#EXTINF:8, no desc
oceans_aes-audio=65000-video=236000-11.ts
#EXTINF:8, no desc
oceans_aes-audio=65000-video=236000-12.ts
#EXTINF:6, no desc
oceans_aes-audio=65000-video=236000-13.ts
#EXTINF:9, no desc
oceans_aes-audio=65000-video=236000-14.ts
#EXTINF:5, no desc
oceans_aes-audio=65000-video=236000-15.ts
#EXT-X-ENDLIST
`

export const remoteVodLevel = `#EXTM3U
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-TARGETDURATION:10
#EXT-X-ALLOW-CACHE:YES
#EXTINF:10,
130130211307_1.ts
#EXTINF:10,
130130211307_2.ts
#EXTINF:10,
130130211307_3.ts
#EXTINF:10,
130130211307_4.ts
#EXTINF:10,
130130211307_5.ts
#EXTINF:10,
130130211307_6.ts
#EXTINF:10,
130130211307_7.ts
#EXTINF:10,
130130211307_8.ts
#EXTINF:10,
130130211307_9.ts
#EXTINF:10,
130130211307_10.ts
#EXTINF:10,
130130211307_11.ts
#EXTINF:10,
130130211307_12.ts
#EXTINF:10,
130130211307_13.ts
#EXTINF:10,
130130211307_14.ts
#EXTINF:10,
130130211307_15.ts
#EXTINF:10,
130130211307_16.ts
#EXTINF:10,
130130211307_17.ts
#EXTINF:10,
130130211307_18.ts
#EXTINF:10,
130130211307_19.ts
#EXT-X-ENDLIST
`

export const proxyVodLevel = `#EXTM3U
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-TARGETDURATION:10
#EXT-X-ALLOW-CACHE:YES
#EXTINF:10,
frag_1?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_1.ts
#EXTINF:10,
frag_2?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_2.ts
#EXTINF:10,
frag_3?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_3.ts
#EXTINF:10,
frag_4?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_4.ts
#EXTINF:10,
frag_5?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_5.ts
#EXTINF:10,
frag_6?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_6.ts
#EXTINF:10,
frag_7?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_7.ts
#EXTINF:10,
frag_8?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_8.ts
#EXTINF:10,
frag_9?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_9.ts
#EXTINF:10,
frag_10?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_10.ts
#EXTINF:10,
frag_11?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_11.ts
#EXTINF:10,
frag_12?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_12.ts
#EXTINF:10,
frag_13?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_13.ts
#EXTINF:10,
frag_14?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_14.ts
#EXTINF:10,
frag_15?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_15.ts
#EXTINF:10,
frag_16?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_16.ts
#EXTINF:10,
frag_17?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_17.ts
#EXTINF:10,
frag_18?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_18.ts
#EXTINF:10,
frag_19?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_19.ts
#EXT-X-DISCONTINUITY
#EXT-X-ALLOW-CACHE:YES
#EXTINF:10,
frag_1?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_1.ts
#EXTINF:10,
frag_2?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Fcaptions%2F130130211307_2.ts`

export const remoteVodLevelAESUrl =
  'https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans_aes-audio=65000-video=236000.m3u8'

export const proxyVodLevelAES = `#EXTM3U
#EXT-X-VERSION:1
## Created with Unified Streaming Platform(version=1.6.7)
#EXT-X-MEDIA-SEQUENCE:36
#EXT-X-TARGETDURATION:11
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000006
#EXTINF:6, no desc
frag_6?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-6.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000007
#EXTINF:9, no desc
frag_7?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-7.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000008
#EXTINF:7, no desc
frag_8?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-8.ts`

export const proxyVodToVodInjectedText = `#EXTM3U
#EXT-X-VERSION:1
## Created with Unified Streaming Platform(version=1.6.7)
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-TARGETDURATION:11
#EXT-X-ALLOW-CACHE:NO
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key"
#EXTINF:11, no desc
frag_1?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-1.ts
#EXTINF:7, no desc
frag_2?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-2.ts
#EXTINF:7, no desc
frag_3?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-3.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=NONE
#EXTINF:10.000000,
custom_frag_0?sessionId=9FY&url=https%3A%2F%2Ftest-streams.mux.dev%2Ftest_001%2Fstream_800k_48k_640x360_000.ts
#EXTINF:10.000000,
custom_frag_1?sessionId=9FY&url=https%3A%2F%2Ftest-streams.mux.dev%2Ftest_001%2Fstream_800k_48k_640x360_001.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000005
#EXTINF:10, no desc
frag_5?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-5.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000006
#EXTINF:6, no desc
frag_6?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-6.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000007
#EXTINF:9, no desc
frag_7?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-7.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000008
#EXTINF:7, no desc
frag_8?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-8.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000009
#EXTINF:9, no desc
frag_9?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-9.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000A
#EXTINF:8, no desc
frag_10?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-10.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000B
#EXTINF:8, no desc
frag_11?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-11.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000C
#EXTINF:8, no desc
frag_12?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-12.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000D
#EXTINF:6, no desc
frag_13?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-13.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000E
#EXTINF:9, no desc
frag_14?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-14.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x0000000000000000000000000000000F
#EXTINF:5, no desc
frag_15?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-15.ts
#EXT-X-ENDLIST`

export const proxyVodToLiveInjectedText = `#EXTM3U
#EXT-X-VERSION:1
## Created with Unified Streaming Platform(version=1.6.7)
#EXT-X-MEDIA-SEQUENCE:32
#EXT-X-TARGETDURATION:11
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000002
#EXTINF:7, no desc
frag_2?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-2.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000003
#EXTINF:7, no desc
frag_3?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-3.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=NONE
#EXTINF:10.000000,
custom_frag_0?sessionId=9FY&url=https%3A%2F%2Ftest-streams.mux.dev%2Ftest_001%2Fstream_800k_48k_640x360_000.ts
#EXTINF:10.000000,
custom_frag_1?sessionId=9FY&url=https%3A%2F%2Ftest-streams.mux.dev%2Ftest_001%2Fstream_800k_48k_640x360_001.ts
#EXT-X-DISCONTINUITY
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000005
#EXTINF:10, no desc
frag_5?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-5.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans.key",IV=0x00000000000000000000000000000006
#EXTINF:6, no desc
frag_6?sessionId=9FY&url=https%3A%2F%2Fplayertest.longtailvideo.com%2Fadaptive%2Foceans_aes%2Foceans_aes-audio%3D65000-video%3D236000-6.ts`

export const injectedTwoFrags = `#EXTINF:10.000000,
https://test-streams.mux.dev/test_001/stream_800k_48k_640x360_000.ts
#EXTINF:10.000000,
https://test-streams.mux.dev/test_001/stream_800k_48k_640x360_001.ts`
