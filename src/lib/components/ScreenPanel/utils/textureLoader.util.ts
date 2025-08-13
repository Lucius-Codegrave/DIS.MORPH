import type { Texture2D } from 'regl';
import type {
  ImageTextureLoader,
  VideoTextureLoader,
  VideoTextureData,
} from 'src/lib/types/types';

/**
 * Loads an image from the specified URL and creates a REGL texture from it.
 */
export const loadImageTexture: ImageTextureLoader = (
  url: string,
  reglInstance: createREGL.Regl
): Promise<Texture2D> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => {
      const texture = reglInstance.texture({
        data: image,
      });
      resolve(texture);
    };
    image.onerror = (err) => {
      reject(err);
    };
  });
};

/**
 * Loads a video from the specified URL and creates a REGL texture from it.
 */
export const loadVideoTexture: VideoTextureLoader = (
  url: string,
  videoPlaybackRate: number,
  reglInstance: createREGL.Regl
): Promise<VideoTextureData> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'metadata';
    video.playbackRate = videoPlaybackRate;

    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const tryPlay = () => {
      return video.play().catch((error) => {
        console.warn('Video autoplay failed:', error);
        if (isMobile) {
          video.muted = true;
          return video.play();
        }
        throw error;
      });
    };

    video.oncanplaythrough = () => {
      tryPlay()
        .then(() => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const texture = reglInstance.texture({
              data: video,
              width: video.videoWidth,
              height: video.videoHeight,
            });
            resolve({ texture, video });
          } else {
            reject(new Error('Invalid video dimensions'));
          }
        })
        .catch(reject);
    };

    video.onerror = (err) => {
      console.error('Video loading error:', err);
      reject(err);
    };

    if (isMobile) {
      const playOnInteraction = () => {
        tryPlay().catch(console.error);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('click', playOnInteraction);
      };

      document.addEventListener('touchstart', playOnInteraction, {
        once: true,
      });
      document.addEventListener('click', playOnInteraction, { once: true });
    }
  });
};
