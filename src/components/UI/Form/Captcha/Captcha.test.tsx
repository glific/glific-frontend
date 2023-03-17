import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { Button } from '../Button/Button';
import * as Recaptcha from 'react-google-recaptcha-v3';

import { Captcha } from './Captcha';

const onClickMock = vi.fn();
const tokenUpdateMock = vi.fn();

describe('<Captcha />', () => {
  const props = {
    onTokenUpdate: tokenUpdateMock,
    action: 'register',
    children: <div>Button</div>,
    component: Button,
    onClick: onClickMock,
    'data-testid': 'captcha-button',
  };

  const wrapper = (
    <GoogleReCaptchaProvider reCaptchaKey="fake_key">
      <Captcha {...props} />
    </GoogleReCaptchaProvider>
  );

  it('should render captcha correctly', async () => {
    render(wrapper);
    const button = screen.getByTestId('captcha-button');
    expect(button).toBeInTheDocument();
  });

  it('onClick event handler should be called if we click on button', async () => {
    render(wrapper);
    const button = screen.getByTestId('captcha-button');
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalled();
  });

  it('onTokenUpdate event handler should be called if we click on button', async () => {
    const useRecaptcha = vi.spyOn(Recaptcha, 'useGoogleReCaptcha');
    useRecaptcha.mockImplementation(() => ({ executeRecaptcha: () => Promise.resolve('Success') }));
    render(wrapper);
    const button = screen.getByTestId('captcha-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(tokenUpdateMock).toBeCalled();
    });
  });
});
