import React from 'react';
import CallMadeSharpIcon from '@material-ui/icons/CallMadeSharp';

import GlificLogo from 'assets/images/logo/Logo.svg';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './StaticOrganizationContents.module.css';

export interface StaticOrganizationContetsProps {
  title: string;
  subtitle: string;
  links?: any;
  buttonText?: any;
  handleStep?: any;
}
export const StaticOrganizationContents: React.SFC<StaticOrganizationContetsProps> = (props) => {
  const { title, subtitle, links, buttonText, handleStep } = props;
  let preRequisites;
  if (links) {
    preRequisites = links.map((item: any, index: number) => {
      const key = index;
      return (
        <li key={key}>
          <a href={item.link} target="_blank" rel="noreferrer">
            {item.title}
            <CallMadeSharpIcon className={styles.redirectLinkIcon} />
          </a>
        </li>
      );
    });
  }

  return (
    <div className={styles.Container} data-testid="setupInformation">
      <div className={styles.Organization}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={styles.Title}>
          <span>{title}</span>
        </div>
        <div className={styles.subtitle}>{subtitle}</div>
        {links ? (
          <div className={styles.links} data-testid="pre-requisite-links">
            <ol aria-label="links">{preRequisites}</ol>
          </div>
        ) : null}
        {buttonText ? (
          <div>
            <Button
              variant="contained"
              color="primary"
              className={styles.continueButton}
              data-testid="ContinueButton"
              onClick={handleStep}
            >
              {buttonText}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default StaticOrganizationContents;
