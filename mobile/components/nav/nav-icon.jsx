import { View } from 'react-native';

// A tiny, dependency-free icon set built from plain Views (borders, radius,
// rotation). No icon font/SVG library is installed in this project, and
// this renders pixel-identical across Android, iOS, and web via
// react-native-web instead of depending on font glyph coverage.

function Box({ size, children }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
  );
}

function Home({ size, color }) {
  const roofSize = size * 0.62;
  return (
    <Box size={size}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: roofSize / 2,
          borderRightWidth: roofSize / 2,
          borderBottomWidth: roofSize * 0.62,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.62,
          height: size * 0.38,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: -1,
        }}
      />
    </Box>
  );
}

function CircleArrow({ size, color, direction }) {
  const ring = Math.max(2, size * 0.1);
  const arrowW = size * 0.34;
  const arrowH = size * 0.28;
  const pointingUp = direction === 'up';
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.86,
          height: size * 0.86,
          borderRadius: (size * 0.86) / 2,
          borderWidth: ring,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: arrowW / 2,
            borderRightWidth: arrowW / 2,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            ...(pointingUp
              ? { borderBottomWidth: arrowH, borderBottomColor: color }
              : { borderTopWidth: arrowH, borderTopColor: color }),
          }}
        />
      </View>
    </Box>
  );
}

function Ring({ size, color }) {
  const ring = Math.max(3, size * 0.22);
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: (size * 0.82) / 2,
          borderWidth: ring,
          borderColor: color,
        }}
      />
    </Box>
  );
}

function Dot({ size, color }) {
  return (
    <Box size={size}>
      <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: (size * 0.7) / 2, backgroundColor: color }} />
    </Box>
  );
}

function Bars({ size, color, heights }) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'flex-end', gap: size * 0.1 }}>
      {heights.map((h, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: `${h * 100}%`,
            backgroundColor: color,
            borderRadius: size * 0.08,
          }}
        />
      ))}
    </View>
  );
}

function Lines({ size, color, widths }) {
  return (
    <View style={{ width: size, justifyContent: 'center', gap: size * 0.16 }}>
      {widths.map((w, index) => (
        <View
          key={index}
          style={{
            width: `${w * 100}%`,
            height: Math.max(2, size * 0.13),
            backgroundColor: color,
            borderRadius: size * 0.07,
          }}
        />
      ))}
    </View>
  );
}

function Heart({ size, color }) {
  const s = size * 0.46;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: s,
          height: s,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ rotate: '45deg' }],
          top: size * 0.29,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: color,
          top: size * 0.08,
          left: size / 2 - s,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: color,
          top: size * 0.08,
          left: size / 2,
        }}
      />
    </View>
  );
}

function Gear({ size, color }) {
  const core = size * 0.56;
  const tickLong = size * 0.24;
  const tickShort = size * 0.15;
  const tickStyle = { position: 'absolute', backgroundColor: color, borderRadius: 2 };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[tickStyle, { top: 0, width: tickShort, height: tickLong }]} />
      <View style={[tickStyle, { bottom: 0, width: tickShort, height: tickLong }]} />
      <View style={[tickStyle, { left: 0, width: tickLong, height: tickShort }]} />
      <View style={[tickStyle, { right: 0, width: tickLong, height: tickShort }]} />
      <View
        style={{
          width: core,
          height: core,
          borderRadius: core / 2,
          borderWidth: Math.max(2, size * 0.14),
          borderColor: color,
        }}
      />
    </View>
  );
}

function More({ size, color }) {
  const dot = Math.max(3, size * 0.16);
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: size * 0.14 }}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

const ICONS = {
  home: Home,
  income: (props) => <CircleArrow {...props} direction="up" />,
  expenses: (props) => <CircleArrow {...props} direction="down" />,
  budgets: Ring,
  savings: Dot,
  bills: (props) => <Lines {...props} widths={[1, 0.8, 0.6]} />,
  reports: (props) => <Bars {...props} heights={[0.45, 0.75, 1]} />,
  health: Heart,
  settings: Gear,
  more: More,
};

export function NavIcon({ name, size = 22, color = '#0F172A' }) {
  const Glyph = ICONS[name];
  if (!Glyph) {
    return <Dot size={size} color={color} />;
  }
  return <Glyph size={size} color={color} />;
}
