export interface ManagedPhoneOption {
  id: string;
  phone: string;
  label?: string | null;
  status?: string | null;
}

export interface PhoneSelectOption {
  id: string;
  label: string;
}

// Only `active` phones can own or join a group, so drop the rest and format the
// label as "Label — 91xxxx" (falling back to the bare number when unlabeled).
export const toActivePhoneOptions = (phones: ManagedPhoneOption[] = []): PhoneSelectOption[] =>
  (phones || [])
    .filter((phone) => phone?.status === 'active')
    .map((phone) => ({
      id: phone.id,
      label: phone.label ? `${phone.label} — ${phone.phone}` : phone.phone,
    }));
