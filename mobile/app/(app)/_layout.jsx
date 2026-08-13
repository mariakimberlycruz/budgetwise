import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="income" />
      <Stack.Screen name="income-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="expense-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="savings" />
      <Stack.Screen name="savings-goal-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="savings-contribution" options={{ presentation: 'modal' }} />
      <Stack.Screen name="bills" />
      <Stack.Screen name="bill-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reports" />
      <Stack.Screen name="financial-health" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
