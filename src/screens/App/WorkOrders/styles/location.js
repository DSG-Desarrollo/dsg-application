// TabEquipmentLocationStyles.js
import { StyleSheet } from 'react-native';
import theme from '@themes/theme';

const { colors: staticColors } = theme;

export const createLocationStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: staticColors.accent,
    backgroundColor: staticColors.warningSurface,
  },
  chipThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  chipThumbSelected: {
    backgroundColor: staticColors.accent,
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
    color: staticColors.warningDark,
    fontWeight: '600',
  },

  canvasCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
  },

  saveContainer: {
    paddingTop: 16,
    backgroundColor: colors.background,
  },
});