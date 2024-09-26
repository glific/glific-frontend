import styles from './List.module.css';

interface ListProps {
  listItems: any[];
  icon?: any;
}

export const List = ({ listItems, icon }: ListProps) => {
  return (
    <div className={styles.ListContainer}>
      {listItems.map((assistant) => (
        <div className={styles.Item}>
          {icon && <div>{icon}</div>}
          <div className={styles.Itemm}>
            <div className={styles.Header}>
              <span className={styles.Title}>{assistant.title}</span>
              <span className={styles.Date}>{assistant.inserted_at}</span>
            </div>
            <span className={styles.Id}>{assistant.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
