// React 19's test renderer requires this flag to know it's running inside
// an act()-aware environment; @testing-library/react-native (as installed)
// doesn't set it for us yet, so state updates from effects/async work in
// tests need it set explicitly to avoid "not wrapped in act(...)" warnings
// (and renderHook() failing to flush) for the whole suite.
global.IS_REACT_ACT_ENVIRONMENT = true;
