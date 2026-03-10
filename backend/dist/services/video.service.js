import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
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
    fs.mkdirSync(outputPath, { recursive: true }); // create the output directory if it doesn't exist
    const masterPlaylist = `${outputPath}/master.m3u8`; //path to the master playlist
    const masterContent = [];
    let countProcessing = 0;
    resolutions.forEach((resolution) => {
        const variantOutput = `${outputPath}/${resolution.height}p`;
        const variantPlaylist = `${variantOutput}/playlist.m3u8`; //path to the variant playlist 
        fs.mkdirSync(variantOutput, { recursive: true }); // create the variant directory if it doesn't exist
        ffmpeg(inputPath)
            .outputOptions([
            `-vf scale=w=${resolution.width}:h=${resolution.height}`, // resize the video to the desired resolution
            '-b:v ' + resolution.bitRate + 'k', // bitrate for the video
            '-maxrate ' + resolution.bitRate + 'k',
            '-bufsize ' + (resolution.bitRate * 2) + 'k',
            '-hls_time 10',
            'codec:a acc', // audio codec 
            '-hls_playlist_type vod', // vod playlist type
            `-hls_segment_filename ${variantOutput}/segment%03d.ts`,
        ])
            .output(variantPlaylist) // output to the variant playlist
            .on('end', () => {
            // when the processing end 
            masterContent.push(`#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n` +
                `${resolution.height}p/playlist.m3u8`);
            countProcessing += 1;
            if (countProcessing === resolutions.length) {
                console.log("processing complete");
                console.log(masterContent);
                fs.writeFileSync(masterPlaylist, `#EXTM3U\n${masterContent.join('\n')}`);
                callback(null, masterPlaylist); // call the callback function with the master playlist path
            }
        })
            .on('error', (error) => {
            console.log("An error occured during processing", error);
            // when an error occurs
            callback(error); // call the callback function with the error object
        })
            .run();
    });
};
//# sourceMappingURL=video.service.js.map