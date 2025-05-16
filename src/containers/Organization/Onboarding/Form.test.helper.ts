const platformDetails = {
  api_key: 'api-key',
  app_name: 'app name',
  phone: '7834811114',
  shortcode: 'glific',
  name: 'org name',
  token: 'some-token',
};

const orgDetails = {
  org_details: {
    gstin: '',
    registered_address: {
      address_line1: 'line1',
      address_line2: 'line2',
      city: 'City',
      state: 'State',
      country: 'Country',
      pincode: '123456',
    },
    current_address: {
      address_line1: 'line1',
      address_line2: 'line2',
      city: 'City',
      state: 'State',
      country: 'Country',
      pincode: '123456',
    },
  },
  registration_id: 1,
  org_id: 2,
  has_submitted: false,
};

const paymentDetails = {
  finance_poc: {
    firstName: 'finance poc firstName',
    lastName: 'finance poc lastName',
    designation: 'finance',
    phone: '09421050449',
    email: 'finance@email.com',
    billing_frequency: 'Annually',
    name: 'finance poc firstName finance poc firstName',
  },
  registration_id: 1,
  org_id: 2,
  has_submitted: false,
  billing_frequency: 'Annually',
};
export const setRegistrationData = (activeStep: Number) => {
  let registrationData: any = {
    activeStep,
    registration_details: {
      registration_id: 2,
      org_id: 3,
      submitted: true,
    },
  };

  switch (activeStep) {
    case 0:
      registrationData = {
        ...registrationData,
        platformDetails,
      };
      break;
    case 1:
      registrationData = {
        ...registrationData,
        platformDetails,
        orgDetails,
      };
      break;
    case 2:
      registrationData = {
        ...registrationData,
        platformDetails,
        orgDetails,
        paymentDetails,
      };
      break;
    default:
      break;
  }

  localStorage.setItem('registrationData', JSON.stringify(registrationData));
};
