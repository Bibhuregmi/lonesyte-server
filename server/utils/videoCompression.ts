import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import {Readable, PassThrough} from 'stream'

ffmpeg.setFfmpegPath(ffmpegPath.path); 
//Compressing video with ffmpeg --> getting buffer from @param and @returns PassThrough stream of compressed file
export const compressVideo = async (buffer: Buffer): Promise<PassThrough> => {
    const inputStream = new Readable(); 
    inputStream.push(buffer);
    inputStream.push(null);
    const outputStream = new PassThrough(); 
    
    await new Promise<void>((resolve, reject) => {
        ffmpeg(inputStream).outputOption([
            '-vcodec libx264', //video codec
            '-crf 28', //compression quality
            '-preset fast' //encoding speed
        ]).format('mp4').on('error', () => reject(new Error('Something went wrong'))).on('end', () => resolve()).pipe(outputStream, {end: true})
    })
    return outputStream; 
}
