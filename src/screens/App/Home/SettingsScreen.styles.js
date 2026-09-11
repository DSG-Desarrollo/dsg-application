// SettingsScreen.styles.js
import { StyleSheet } from 'react-native';

export const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  subheader: {
    color: colors.textSecondary,
  },
  item: {
    paddingVertical: 0,
  },
  itemTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  option: {
    paddingVertical: 2,
  },
  optionLabel: {
    color: colors.text,
  },
});
