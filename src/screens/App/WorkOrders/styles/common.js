import { StyleSheet } from "react-native";
import { spacing, palette } from '@themes';

const { blue, red, white } = palette;
const { xl, xxl } = spacing;

export const common = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: xl,
    paddingVertical: xxl,
  },
});