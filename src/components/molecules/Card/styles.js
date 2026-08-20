import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",

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
    color: "#111827",
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
});

export default styles;