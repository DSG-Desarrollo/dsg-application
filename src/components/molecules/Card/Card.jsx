import React from "react";
import PropTypes from "prop-types";
import { Text, View } from "react-native";
import styles from "./styles";

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

export default Card;