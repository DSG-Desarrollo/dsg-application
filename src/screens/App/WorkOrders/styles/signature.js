import { StyleSheet } from "react-native";

export const createSignatureStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 16 },

  saveContainer: {
    padding: 16,
    backgroundColor: colors.background,
  },

  formCard: { marginBottom: 16 },

  instructionText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fixedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: colors.text,
    paddingBottom: 8,
  },
  underline: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  inputError: {
    borderBottomColor: colors.danger,
  },
  errorContainer: { marginTop: 6 },
  errorText: { fontSize: 12, color: colors.danger },
});