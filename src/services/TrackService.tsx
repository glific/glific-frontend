import axios from 'axios';
import { USER_TRACKER } from 'config';

export function Track(event: string) {
  axios
    .post(USER_TRACKER, {
      event,
    })
    .catch((error) => {
      console.log('Failed to track', error);
    });
}

export default Track;
