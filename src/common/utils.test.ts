import { downloadFile } from './utils';

describe('downloadFile', () => {
  const stubLink = () => {
    const click = vi.fn();
    const link = { href: '', target: '', download: '', click } as unknown as HTMLAnchorElement;
    const create = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const append = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const remove = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    return { link, click, restore: () => [create, append, remove].forEach((spy) => spy.mockRestore()) };
  };

  test('opens in a new tab unless told otherwise', () => {
    const { link, click, restore } = stubLink();

    downloadFile('https://files.test/report.pdf', 'report.pdf');

    expect(link.href).toBe('https://files.test/report.pdf');
    expect(link.download).toBe('report.pdf');
    expect(link.target).toBe('_blank');
    expect(click).toHaveBeenCalled();
    restore();
  });

  test('takes the target it is given, so a caller can save in place', () => {
    const { link, restore } = stubLink();

    downloadFile('https://files.test/report.pdf', 'report.pdf', '_self');

    expect(link.target).toBe('_self');
    restore();
  });
});
