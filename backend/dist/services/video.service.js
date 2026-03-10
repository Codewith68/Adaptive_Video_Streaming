import fs from 'fs';
import 'dotenv/config';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
const sanitizePath = (value) => {
    if (!value)
        return undefined;
    const cleaned = value.trim().replace(/^["']|["']$/g, '');
    return cleaned.length ? cleaned : undefined;
};
const resolveFfmpegPath = () => {
    const envPath = sanitizePath(process.env.FFMPEG_PATH);
    // Must be an actual FILE, not a directory
    if (envPath && fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
        console.log("Using FFMPEG_PATH from .env:", envPath);
        return envPath;
    }
    // Fallback to ffmpeg-static binary
    const staticPath = (typeof ffmpegStatic === 'string' ? ffmpegStatic : ffmpegStatic?.default);
    if (staticPath && fs.existsSync(staticPath)) {
        console.log("Using ffmpeg-static:", staticPath);
        return staticPath;
    }
    console.log("WARNING: No valid ffmpeg path found! envPath:", envPath, "ffmpegStatic:", staticPath);
    return undefined;
};
const configuredFfmpegPath = resolveFfmpegPath();
if (configuredFfmpegPath)
    ffmpeg.setFfmpegPath(configuredFfmpegPath);
const resolutions = [
    { width: 1920, height: 1080, bitRate: 2000 },
    { width: 1280, height: 720, bitRate: 1000 },
    { width: 854, height: 480, bitRate: 500 },
    { width: 640, height: 360, bitRate: 400 },
    { width: 426, height: 240, bitRate: 300 },
    { width: 320, height: 180, bitRate: 200 }
];
/**
 *
 * @param inputPath  the path to the input video file
 * @param outputPath the path where the proccessed Hls file will be saved
 * @param callback A callback function that is called when the proccessed is completed ,
 * the callback function receive an error object when an error occured
 * and a master playlist string when the processees are successful.
 */
export const processVideoForHls = (inputPath, outputPath, callback) => {
    let callbackCalled = false;
    const finish = (error, playlist) => {
        if (callbackCalled)
            return;
        callbackCalled = true;
        callback(error, playlist);
    };
    if (configuredFfmpegPath && !fs.existsSync(configuredFfmpegPath)) {
        finish(new Error(`FFMPEG_PATH is invalid: ${configuredFfmpegPath}`));
        return;
    }
    ffmpeg.getAvailableFormats((formatsError) => {
        if (formatsError) {
            const attempted = configuredFfmpegPath ?? 'not found from env/common paths/PATH';
            finish(new Error(`FFmpeg is not available. Attempted path: ${attempted}. Add FFMPEG_PATH to backend/.env or add ffmpeg.exe to Windows PATH.`));
            return;
        }
        fs.mkdirSync(outputPath, { recursive: true }); // create the output directory if it doesn't exist
        const masterPlaylist = `${outputPath}/master.m3u8`; //path to the master playlist
        const masterContent = [];
        const processSequentially = async () => {
            for (const resolution of resolutions) {
                if (callbackCalled)
                    return;
                const variantOutput = `${outputPath}/${resolution.height}p`;
                const variantPlaylist = `${variantOutput}/playlist.m3u8`; //path to the variant playlist 
                fs.mkdirSync(variantOutput, { recursive: true }); // create the variant directory if it doesn't exist
                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .outputOptions([
                        `-vf scale=w=${resolution.width}:h=${resolution.height}`, // resize the video to the desired resolution
                        '-b:v ' + resolution.bitRate + 'k', // bitrate for the video
                        '-maxrate ' + resolution.bitRate + 'k',
                        '-bufsize ' + (resolution.bitRate * 2) + 'k',
                        '-hls_time 10',
                        '-c:a aac', // audio codec
                        '-hls_playlist_type vod', // vod playlist type
                        `-hls_segment_filename ${variantOutput}/segment%03d.ts`,
                    ])
                        .output(variantPlaylist) // output to the variant playlist
                        .on('end', () => {
                        masterContent.push(`#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n` +
                            `${resolution.height}p/playlist.m3u8`);
                        resolve();
                    })
                        .on('error', (error) => {
                        console.log("An error occured during processing", error);
                        reject(error);
                    })
                        .run();
                });
            }
        };
        processSequentially()
            .then(() => {
            if (callbackCalled)
                return;
            console.log("processing complete");
            console.log(masterContent);
            fs.writeFileSync(masterPlaylist, `#EXTM3U\n${masterContent.join('\n')}`);
            finish(null, masterPlaylist); // call the callback function with the master playlist path
        })
            .catch((error) => {
            if (callbackCalled)
                return;
            finish(error);
        });
    });
};
//# sourceMappingURL=video.service.js.map