import React, { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";
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

// Miniatura individual de una foto. Las fotos remotas (ya guardadas) se descargan desde
// el proxy de S3 y pueden tardar en llegar; muestra su propio indicador de carga hasta
// que el <Image> resuelve (o falla), en vez de dejar el recuadro en blanco mientras tanto.
const PhotoThumbnail = ({ photo, onRemove }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.thumb}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.thumbImage}
        onLoadEnd={() => setIsLoading(false)}
      />

      {isLoading && (
        <View style={styles.thumbLoading}>
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
        </View>
      )}

      <Pressable
        style={styles.removeBtn}
        onPress={() => onRemove(photo)}
      >
        <FontAwesomeIcon
          icon={faTimes}
          size={10}
          color={theme.colors.textInverse}
        />
      </Pressable>
    </View>
  );
};

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
      {photos.map((photo) => (
        <PhotoThumbnail key={photo.id} photo={photo} onRemove={onRemove} />
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

  thumbLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surface,
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