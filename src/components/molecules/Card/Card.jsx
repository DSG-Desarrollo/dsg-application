import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View } from "react-native";

const Card = ({
  title,
  content,
  footer,
  children,
  style,
  titleStyle,
  contentStyle,
  footerStyle,
}) => {
  return (
    <View style={[styles.card, style]}>
      {title !== undefined && title !== null && (
        <View style={styles.header}>
          {typeof title === "string" ? (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          ) : (
            title
          )}
        </View>
      )}

      {(content !== undefined && content !== null) || children ? (
        <View style={[styles.content, contentStyle]}>
          {content !== undefined && content !== null ? (
            typeof content === "string" ? (
              <Text style={styles.contentText}>{content}</Text>
            ) : (
              content
            )
          ) : (
            children
          )}
        </View>
      ) : null}

      {footer !== undefined && footer !== null && (
        <View style={[styles.footer, footerStyle]}>{footer}</View>
      )}
    </View>
  );
};

Card.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  children: PropTypes.node,
  style: PropTypes.object,
  titleStyle: PropTypes.object,
  contentStyle: PropTypes.object,
  footerStyle: PropTypes.object,
};

Card.defaultProps = {
  title: null,
  content: null,
  footer: null,
  children: null,
  style: null,
  titleStyle: null,
  contentStyle: null,
  footerStyle: null,
};

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

export default Card;