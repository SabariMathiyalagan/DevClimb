// DevClimb Design System Colors
export const colors = {
  background: "#1A1A1A",
  primary: "#4B7BEC", 
  accent: "#00D1A1",
  text: "#F5F5F5",
  cardBackground: "#1C1C1E",
  border: "#2C2C2E",
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30"
};

// Legacy theme structure for compatibility
const tintColorLight = colors.primary;
const tintColorDark = colors.accent;

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: tintColorLight,
    tabIconDefault: colors.border,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: tintColorDark,
    tabIconDefault: colors.border,
    tabIconSelected: tintColorDark,
  },
};
