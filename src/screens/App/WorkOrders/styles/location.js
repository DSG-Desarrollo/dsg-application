// TabEquipmentLocationStyles.js
import { StyleSheet } from 'react-native';
import theme from '@themes/theme';
import { palette } from '@themes';

const { colors } = theme;

export const location = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: palette.gray[50],
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  chipRow: {
    flexGrow: 0,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chip: {
    width: 68,
    alignItems: 'center',
    marginRight: 8,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderAlternative,
    backgroundColor: colors.uiBackground,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.warningSurface,
  },
  chipThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: palette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  chipThumbSelected: {
    backgroundColor: colors.accent,
  },
  chipThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  chipLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 12,
  },
  chipLabelSelected: {
    color: colors.warningDark,
    fontWeight: '600',
  },

  canvasCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderColor,
    backgroundColor: colors.uiBackground,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
  },

  saveContainer: {
    paddingTop: 16,
    backgroundColor: colors.uiBackground,
  },
});