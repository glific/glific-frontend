import dayjs from 'dayjs';
import styles from './Success.module.css';

import Check from 'assets/images/Check.svg';

export const Success = () => {
  const date = dayjs().format('MMM, DD YYYY');
  return (
    <div className={styles.Container}>
      <div className={styles.Main}>
        <img className={styles.Check} src={Check} />
        <div>
          <h1>Success!</h1>
          <p>
            Your application has been submitted successfully. Our team will get back to you within 2
            working days. Please note: Start date of your billing would be{' '}
            <span className={styles.Date}>{date}</span>.{' '}
          </p>
          <p>Enjoy a hassle-free service from us. Thank you!</p>
        </div>
      </div>
    </div>
  );
};
