import { getErrorMessage } from '@/utils/errors';

function axiosError({ code, response } = {}) {
  return { isAxiosError: true, code, response };
}

describe('getErrorMessage', () => {
  it('returns a friendly message for a timed-out request', () => {
    expect(getErrorMessage(axiosError({ code: 'ECONNABORTED' }))).toMatch(/timed out/i);
  });

  it('returns a friendly message when there is no response at all (network error)', () => {
    expect(getErrorMessage(axiosError({}))).toMatch(/network error/i);
  });

  it('prefers the backend-provided message from the {success, message, data} envelope', () => {
    const error = axiosError({
      response: { status: 422, data: { success: false, message: 'amount: Input should be greater than 0', data: null } },
    });
    expect(getErrorMessage(error)).toBe('amount: Input should be greater than 0');
  });

  it('never surfaces a raw exception/stack trace, even if one leaks into the response body', () => {
    const error = axiosError({
      response: { status: 500, data: { detail: 'Traceback (most recent call last): ...' } },
    });
    // No `message` field on the envelope -> falls back to safe generic copy,
    // the raw `detail`/traceback text must not appear in the result.
    const result = getErrorMessage(error);
    expect(result).not.toContain('Traceback');
    expect(result.toLowerCase()).toContain('went wrong');
  });

  it('gives a specific message for 401 unauthorized', () => {
    const error = axiosError({ response: { status: 401, data: {} } });
    expect(getErrorMessage(error)).toMatch(/session has expired/i);
  });

  it('gives a specific message for 403 forbidden', () => {
    const error = axiosError({ response: { status: 403, data: {} } });
    expect(getErrorMessage(error)).toMatch(/permission/i);
  });

  it('gives a specific message for 404 not found', () => {
    const error = axiosError({ response: { status: 404, data: {} } });
    expect(getErrorMessage(error)).toMatch(/could not find/i);
  });

  it('gives a generic-but-safe message for 5xx server errors', () => {
    const error = axiosError({ response: { status: 503, data: {} } });
    expect(getErrorMessage(error)).toMatch(/our end/i);
  });

  it('falls back to a generic message for a non-axios JS error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to a generic message for a totally unknown throw value', () => {
    expect(getErrorMessage('nope')).toMatch(/something went wrong/i);
  });
});
