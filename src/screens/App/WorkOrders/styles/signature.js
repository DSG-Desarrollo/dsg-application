import { StyleSheet } from "react-native";
import { palette } from '@themes';

const { blue, white } = palette;

export const signature = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 16 },

  saveContainer: {
    padding: 16,
    backgroundColor: white,
  },

  formCard: { marginBottom: 16 },

  instructionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 16,
  },

  signatureContainer: {
    marginTop: 16,
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
});