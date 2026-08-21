import { StyleSheet } from "react-native";
import { spacing, palette } from '@themes';

const { blue, red, white } = palette;

export const signature = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 16 },

  formCard: { marginBottom: 16 },

  instructionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  canvasContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    backgroundColor: white,
    overflow: 'hidden',
  },
  fixedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  clearButton: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  clearButtonText: { fontSize: 13, color: '#555', fontWeight: '500' },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: '#333',
    paddingBottom: 8,
  },
  underline: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ccc',
  },
  inputError: {
    borderBottomColor: '#C0392B',
  },
  errorContainer: { marginTop: 6 },
  errorText: { fontSize: 12, color: '#C0392B' },

  saveButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: blue[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});