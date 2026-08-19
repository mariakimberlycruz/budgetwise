import { render } from '@testing-library/react-native';

import { ProgressBar } from '@/components/dashboard/progress-bar';

jest.mock('@/hooks/use-theme', () => ({
  useThemeColors: () => ({ backgroundElement: '#F1F5F9', tint: '#0EA5E9' }),
}));

function fillWidth(toJSON) {
  const track = toJSON();
  const fill = track.children[0];
  return fill.props.style.find((s) => s && 'width' in s).width;
}

describe('ProgressBar (core component)', () => {
  it('renders a proportional fill for a normal progress value', async () => {
    const { toJSON } = await render(<ProgressBar progress={0.5} />);
    expect(fillWidth(toJSON)).toBe('50%');
  });

  it('clamps progress above 100% instead of overflowing the track', async () => {
    const { toJSON } = await render(<ProgressBar progress={1.8} />);
    expect(fillWidth(toJSON)).toBe('100%');
  });

  it('clamps negative progress to 0 instead of going negative', async () => {
    const { toJSON } = await render(<ProgressBar progress={-0.5} />);
    expect(fillWidth(toJSON)).toBe('0%');
  });

  it('treats a non-numeric progress value as 0 rather than crashing', async () => {
    const { toJSON } = await render(<ProgressBar progress={undefined} />);
    expect(fillWidth(toJSON)).toBe('0%');
  });
});
