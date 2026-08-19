import { unwrapEnvelope } from '@/services/api-client';

describe('unwrapEnvelope', () => {
  it('unwraps a {success, message, data} envelope so response.data becomes the resource', () => {
    const response = {
      data: { success: true, message: 'Expense created successfully', data: { id: 1, amount: '50.00' } },
    };
    const result = unwrapEnvelope(response);
    expect(result.data).toEqual({ id: 1, amount: '50.00' });
    expect(result.message).toBe('Expense created successfully');
  });

  it('unwraps a null data payload (e.g. after a delete)', () => {
    const response = { data: { success: true, message: 'Expense deleted successfully', data: null } };
    const result = unwrapEnvelope(response);
    expect(result.data).toBeNull();
    expect(result.message).toBe('Expense deleted successfully');
  });

  it('leaves a non-enveloped response untouched (e.g. the /health endpoint)', () => {
    const response = { data: { status: 'ok', service: 'BudgetWise API' } };
    const result = unwrapEnvelope(response);
    expect(result.data).toEqual({ status: 'ok', service: 'BudgetWise API' });
  });

  it('does not choke on a non-object body', () => {
    const response = { data: null };
    expect(() => unwrapEnvelope(response)).not.toThrow();
    expect(response.data).toBeNull();
  });
});
