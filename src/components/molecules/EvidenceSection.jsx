import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCameraRetro, faTimes } from "@fortawesome/free-solid-svg-icons";
import theme from '@themes/theme';
import i18n from '@i18n/i18n'

const { 
  borderColor,
  danger, 
  warningDark, 
  surface, 
  textSecondary, 
  textMuted, 
  border, 
  textDark,
  warningSurface,
 } = theme.colors;

const EvidenceSection = ({
  title,
  icon,
  instruction,
  photos,
  maxPhotos,
  onAddPress,
  onRemove,
}) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <FontAwesomeIcon
        icon={icon}
        size={15}
        color={theme.colors.warning}
      />

      <Text style={styles.title}>{title}</Text>
    </View>

    <View style={styles.instructionBox}>
      <Text style={styles.instructionText}>
        {instruction}
      </Text>
    </View>

    <Text style={styles.counter}>
      {i18n.t('workOrder:photosCounter', { count: photos.length, max: maxPhotos })}
    </Text>

    <View style={styles.grid}>
      {photos.map((uri, index) => (
        <View key={uri + index} style={styles.thumb}>
          <Image
            source={{ uri }}
            style={styles.thumbImage}
          />

          <Pressable
            style={styles.removeBtn}
            onPress={() => onRemove(index)}
          >
            <FontAwesomeIcon
              icon={faTimes}
              size={10}
              color={theme.colors.textInverse}
            />
          </Pressable>
        </View>
      ))}

      {photos.length < maxPhotos && (
        <Pressable
          style={styles.addTile}
          onPress={onAddPress}
        >
          <FontAwesomeIcon
            icon={faCameraRetro}
            size={18}
            color={theme.colors.textSecondary}
          />

          <Text style={styles.addTileText}>
            {i18n.t('ui:btnAdd')}
          </Text>
        </Pressable>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: "500",
    color: textDark,
  },

  instructionBox: {
    backgroundColor: warningSurface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  instructionText: {
    fontSize: 12,
    color: warningDark,
    lineHeight: 17,
  },

  counter: {
    fontSize: 12,
    color: textMuted,
    marginBottom: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  thumb: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: border,
    backgroundColor: surface,
  },

  thumbImage: {
    width: "100%",
    height: "100%",
  },

  removeBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: danger,
    alignItems: "center",
    justifyContent: "center",
  },

  addTile: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: borderColor,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  addTileText: {
    fontSize: 10,
    color: textSecondary,
  },
});


export default EvidenceSection;