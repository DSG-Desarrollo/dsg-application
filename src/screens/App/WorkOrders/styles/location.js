// TabEquipmentLocationStyles.js
import { StyleSheet } from 'react-native';

export const location = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F6F7FB',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  chipRow: {
    flexGrow: 0,
    marginBottom: 16,
  },
  chip: {
    width: 68,
    alignItems: 'center',
    marginRight: 8,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: '#BA7517',
    backgroundColor: '#FCEFDC',
  },
  chipThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  chipThumbSelected: {
    backgroundColor: '#BA7517',
  },
  chipThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  chipLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: '#555',
    lineHeight: 12,
  },
  chipLabelSelected: {
    color: '#412402',
    fontWeight: '600',
  },

  canvasCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    backgroundColor: '#fff',
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
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '500', color: '#555' },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#BA7517',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '500', color: '#FAEEDA' },
});