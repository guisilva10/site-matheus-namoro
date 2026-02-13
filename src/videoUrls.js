// Video URLs from Cloudinary with optimizations
const baseUrls = {
  "/videos/dia-30.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961755/site-matheus/videos/site-matheus/videos/dia-30.mp4",
  "/videos/dia-31.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961796/site-matheus/videos/site-matheus/videos/dia-31.mov",
  "/videos/dia-01/01.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961675/site-matheus/videos/site-matheus/videos/dia-01/01.mov",
  "/videos/dia-02/01.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961686/site-matheus/videos/site-matheus/videos/dia-02/01.mov",
  "/videos/dia-02/02.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961695/site-matheus/videos/site-matheus/videos/dia-02/02.mov",
  "/videos/dia-02/03.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961700/site-matheus/videos/site-matheus/videos/dia-02/03.mov",
  "/videos/dia-02/05.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961722/site-matheus/videos/site-matheus/videos/dia-02/05.mov",
  "/videos/dia-02/06.mp4": "https://res.cloudinary.com/doasv5ahc/video/upload/v1770961734/site-matheus/videos/site-matheus/videos/dia-02/06.mov",
};

// Helper function to get optimized video URL
export const getVideoUrl = (localPath) => {
  const url = baseUrls[localPath];
  if (!url) return localPath;

  // Use original URLs without transformations to avoid 423 errors
  return url;
};

// Helper to get video poster/thumbnail
export const getVideoPoster = (localPath) => {
  const url = baseUrls[localPath];
  if (!url) return null;

  // Generate thumbnail from first frame
  return url.replace('/upload/', '/upload/f_jpg,q_auto:low,w_640/').replace(/\.(mp4|mov)$/, '.jpg');
};

// Helper to create video media object with optimized URL and poster
export const createVideoMedia = (localPath) => ({
  type: "video",
  src: getVideoUrl(localPath),
  poster: getVideoPoster(localPath)
});
