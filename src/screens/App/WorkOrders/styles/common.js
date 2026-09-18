import { StyleSheet } from "react-native";
import { spacing } from '@themes';

const { xl, xxl } = spacing;

export const createCommonStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: xl,
    paddingVertical: xxl,
  },
});