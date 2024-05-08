import dayjs from 'dayjs';
import styles from './Success.module.css';

import Check from 'assets/images/Check.svg';
// import Circles from 'assets/images/Circles.png';

export const Success = () => {
  const date = dayjs().format('MMM, DD YYYY');
  return (
    <div className={styles.Container}>
      {/* <img className={styles.Cirlce} src={Circles} /> */}
      <div className={styles.Main}>
        <img className={styles.Check} src={Check} />
        <div>
          <h1>Success!</h1>
          <p>
            Your form has been successfully submitted. Your Glific instance will now be created and
            shared with you within 1 working day. Your subscription has started on{' '}
            <span className={styles.Date}>{date}</span>.
          </p>
          <p>
            Your account will continue to be billed unless informed by you at{' '}
            <span className={styles.Email}>glific.user@gmail.com</span>
            for cancellation/pausing. Enjoy a hassle-free service from us, thank you!
          </p>
        </div>
      </div>
    </div>
  );
};
