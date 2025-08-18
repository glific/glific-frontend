import styles from './Instructions.module.css';

export const Instructions = () => {
  return (
    <div className={styles.Instructions}>
      <div>
        <h5>Instructions</h5>
        <ul>
          <li>Use this to import new contacts in bulk</li>
          <li>Ensure you have prior permission from the contacts to message them through the chatbot</li>
          <li>Ensure the first message being sent to the newly onboarded contacts is the opt-in message</li>
          <li>
            All phone numbers should be in E164 format (e.g., <code>+91XXXXXXXXXX</code>). Numbers without a
            <code>+</code> prefix will be auto-corrected before validation.
          </li>
          <li>
            Invalid or unparseable numbers will be rejected to prevent delivery failures and maintain data accuracy.
          </li>
        </ul>
      </div>

      <div>
        <h5>Disclaimer</h5>
        <ul>
          <li>
            Contacts who block a chatbot number lead to the reduction in quality rating of the chatbot by Meta. This can
            reduce the limit of business-initiated conversations.
          </li>
          <li>
            Kindly plan to message a large number of new contacts in batches to avoid quality degradation or having your
            chatbot blocked by Meta.
          </li>
        </ul>
      </div>
    </div>
  );
};
