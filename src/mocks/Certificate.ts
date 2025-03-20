import { CREATE_CERTIFICATE, UPDATE_CERTIFICATE } from 'graphql/mutations/Certificate';
import { COUNT_CERTIFICATES, GET_CERTIFICATE, LIST_CERTIFICATES } from 'graphql/queries/Certificate';

const listCertificates = {
  request: {
    query: LIST_CERTIFICATES,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' } },
  },
  result: {
    data: {
      certificateTemplates: [
        {
          __typename: 'CertificateTemplate',
          description: 'description1',
          id: '1',
          label: 'label 1',
          type: 'SLIDES',
          url: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
        },
        {
          __typename: 'CertificateTemplate',
          description: 'description1',
          id: '2',
          label: 'label 2',
          type: 'SLIDES',
          url: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
        },
      ],
    },
  },
};

const countCertificates = {
  request: {
    query: COUNT_CERTIFICATES,
    variables: { filter: {} },
  },
  result: {
    data: {
      countCertificateTemplates: 1,
    },
  },
};

const getCertificate = {
  request: {
    query: GET_CERTIFICATE,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      certificateTemplate: {
        __typename: 'CertificateTemplateResult',
        certificateTemplate: {
          __typename: 'CertificateTemplate',
          description: 'despcription 2',
          id: '1',
          label: 'label 1',
          type: 'SLIDES',
          url: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
        },
        errors: null,
      },
    },
  },
};

const createCertificate = {
  request: {
    query: CREATE_CERTIFICATE,
    variables: {
      input: {
        label: 'label',
        description: 'description',
        url: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
      },
    },
  },
  result: {
    data: {
      createCertificateTemplate: {
        __typename: 'CertificateTemplateResult',
        certificateTemplate: {
          __typename: 'CertificateTemplate',
          id: '4',
          label: 'title',
        },
        errors: null,
      },
    },
  },
};

const updateCertificate = {
  request: {
    query: UPDATE_CERTIFICATE,
    variables: {
      id: '1',
      input: {
        label: 'new label',
        description: 'despcription 2',
        url: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
      },
    },
  },
  result: {
    data: {
      updateCertificateTemplate: {
        __typename: 'CertificateTemplateResult',
        certificateTemplate: {
          __typename: 'CertificateTemplate',
          id: '1',
          label: 'new label',
        },
        errors: null,
      },
    },
  },
};

const deleteCertificate = {
  request: {
    query: LIST_CERTIFICATES,
    variables: {},
  },
  result: {
    data: {},
  },
};

export const CERTIFICATE_LIST_MOCKS = [
  listCertificates,
  listCertificates,
  countCertificates,
  countCertificates,
  getCertificate,
];
export const CERTIFICATE_MOCKS = [createCertificate, updateCertificate, deleteCertificate];
