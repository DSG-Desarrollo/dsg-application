import { palette } from "./colors";

const { blue, red, green, yellow, teal, gray, white } = palette;

export const buttonStyles = {
  // =========================================================
  // PRIMARY
  // =========================================================

  primary: {
    height: 44,
    backgroundColor: blue[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  primaryPressed: {
    backgroundColor: blue[600],
  },

  primaryText: {
    color: white,
    fontSize: 18,
    fontWeight: "600",
  },

  // =========================================================
  // SECONDARY
  // =========================================================

  secondary: {
    height: 44,
    backgroundColor: blue[100],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  secondaryPressed: {
    backgroundColor: blue[50],
  },

  secondaryText: {
    color: blue[700],
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // DANGER
  // =========================================================

  danger: {
    height: 44,
    backgroundColor: red[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  dangerPressed: {
    backgroundColor: red[600],
  },

  dangerText: {
    color: white,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // SUCCESS
  // =========================================================

  success: {
    height: 44,
    backgroundColor: green[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  successPressed: {
    backgroundColor: green[600],
  },

  successText: {
    color: white,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // WARNING
  // =========================================================

  warning: {
    height: 44,
    backgroundColor: yellow[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  warningPressed: {
    backgroundColor: yellow[600],
  },

  warningText: {
    color: white,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // INFO
  // =========================================================

  info: {
    height: 44,
    backgroundColor: teal[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  infoPressed: {
    backgroundColor: teal[600],
  },

  infoText: {
    color: white,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // OUTLINE
  // =========================================================

  outline: {
    height: 44,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: blue[500],
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  outlinePressed: {
    backgroundColor: blue[50],
  },

  outlineText: {
    color: blue[700],
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================================
  // GHOST
  // =========================================================

  ghost: {
    height: 44,
    backgroundColor: "transparent",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  ghostPressed: {
    backgroundColor: gray[100],
  },

  ghostText: {
    color: gray[700],
    fontSize: 14,
    fontWeight: "600",
  },
};