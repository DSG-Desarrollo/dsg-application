import { StyleSheet } from 'react-native';

// Styles
import { palette } from '@themes';

const { white } = palette;

export const supplies = StyleSheet.create({
  progressHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  progressCount: { fontSize: 13, color: '#888' },
  progressTrack: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#BA7517', borderRadius: 4 },

  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  productsContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  statusDotFilled: { backgroundColor: '#639922' },
  productName: { fontSize: 14, fontWeight: '500', color: '#333' },
  productUnit: { fontSize: 12, color: '#999' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  stepperBtnText: { fontSize: 16, color: '#555' },
  stepperInput: {
    width: 30,
    height: 38,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    padding: 0,
  },

  input: {
    width: 80,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    color: '#333',
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  customButtonContainer: {
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
  saveContainer: {
    padding: 16,
    backgroundColor: white,
  }
});