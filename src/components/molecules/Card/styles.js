import { StyleSheet } from "react-native";

const createCardStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,

    // iOS
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Android
    elevation: 2,

    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default createCardStyles;