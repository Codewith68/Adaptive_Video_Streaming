import 'dotenv/config';
/**
 *
 * @param inputPath  the path to the input video file
 * @param outputPath the path where the proccessed Hls file will be saved
 * @param callback A callback function that is called when the proccessed is completed ,
 * the callback function receive an error object when an error occured
 * and a master playlist string when the processees are successful.
 */
export declare const processVideoForHls: (inputPath: string, outputPath: string, callback: (error: Error | null, masterPlaylist?: string) => void) => void;
//# sourceMappingURL=video.service.d.ts.map