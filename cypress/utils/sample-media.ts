// Sample media served by the frontend under test from public/sample-media, so the specs don't
// depend on a third-party host being up. The backend fetches these URLs when it validates media.
const SAMPLE_MEDIA_BASE_URL = `${String(Cypress.config('baseUrl')).replace(/\/$/, '')}/sample-media`;

export const SAMPLE_MEDIA = {
  image: `${SAMPLE_MEDIA_BASE_URL}/sample01.jpg`,
  audio: `${SAMPLE_MEDIA_BASE_URL}/sample01.mp3`,
  video: `${SAMPLE_MEDIA_BASE_URL}/sample01.mp4`,
  document: `${SAMPLE_MEDIA_BASE_URL}/sample01.pdf`,
  sticker: `${SAMPLE_MEDIA_BASE_URL}/SampleSticker01.webp`,
};
