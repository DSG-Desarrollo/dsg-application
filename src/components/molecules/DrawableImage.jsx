import React, { useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { StyleSheet, ImageBackground, View, TouchableOpacity, Dimensions } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";
import {
    Canvas,
    Path,
    Skia,
    useTouchHandler,
    useCanvasRef,
    Image as SkiaImage,
    useImage,
    ImageFormat
} from "@shopify/react-native-skia";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calcular los valores porcentuales (por ejemplo, 50% del tamaño del contenedor)
const imageWidth = screenWidth * 0.65;
const imageHeight = screenHeight * 0.65;

const DrawableImage = forwardRef(({
    fixedImageSource,
    dynamicImageSource,
    strokeColor = "red",
    strokeWidth = 2,
    imageStyle,
    containerStyle,
    clearPaths,
    onPathsCleared,
    blankCanvas,
}, ref) => {
    const canvasRef = useCanvasRef();
    const [paths, setPaths] = useState([]);
    const [undonePaths, setUndonePaths] = useState([]);
    const [hasDrawn, setHasDrawn] = useState(false);

    const image = useImage(fixedImageSource); // Cargar la imagen

    useEffect(() => {
        if (clearPaths) {
            setPaths([]);
            setUndonePaths([]);
            setHasDrawn(false); // Restablecer estado
            onPathsCleared(); // Llamar al callback para restablecer clearPaths
        }
    }, [clearPaths, onPathsCleared]);

    const onDrawingStart = useCallback((touchInfo) => {
        const { x, y } = touchInfo;
        const newPath = Skia.Path.Make();
        newPath.moveTo(x, y);
        setPaths((old) => [...old, newPath]);
        setHasDrawn(true); // Actualizar estado
    }, []);

    const onDrawingActive = useCallback((touchInfo) => {
        const { x, y } = touchInfo;
        setPaths((currentPaths) => {
            const updatedPaths = [...currentPaths];
            const currentPath = updatedPaths[updatedPaths.length - 1];
            currentPath.lineTo(x, y);
            return updatedPaths;
        });
    }, []);

    const undo = useCallback(() => {
        setPaths((currentPaths) => {
            if (currentPaths.length === 0) return currentPaths;
            const updatedPaths = [...currentPaths];
            const undonePath = updatedPaths.pop();
            setUndonePaths((currentUndone) => [...currentUndone, undonePath]);
            return updatedPaths;
        });
    }, []);

    const redo = useCallback(() => {
        setUndonePaths((currentUndone) => {
            if (currentUndone.length === 0) return currentUndone;
            const updatedUndone = [...currentUndone];
            const redonePath = updatedUndone.pop();
            setPaths((currentPaths) => [...currentPaths, redonePath]);
            return updatedUndone;
        });
    }, []);

    const getCanvasBase64 = async () => {
        try {
            const imageSnapshot = canvasRef.current?.makeImageSnapshot();
            if (imageSnapshot) {
                const base64 = await imageSnapshot.encodeToBase64(ImageFormat.PNG);
                return base64;
            } else {
                console.log("No se pudo capturar la imagen del lienzo");
                return null;
            }
        } catch (error) {
            console.error("Error al capturar la imagen del lienzo:", error);
            return null;
        }
    };

    useImperativeHandle(ref, () => ({
        captureCanvas: getCanvasBase64,
        hasDrawn
    }));

    const touchHandler = useTouchHandler({
        onStart: onDrawingStart,
        onActive: onDrawingActive,
    });

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.canvasContainer}>
                <Canvas ref={canvasRef} style={[styles.canvas]} onTouch={touchHandler}>
                    {image && <SkiaImage image={image} x={0} y={0} width={imageWidth} height={imageHeight} fit="contain" />}
                    {paths.map((path, index) => (
                        <Path
                            key={index}
                            path={path}
                            color={strokeColor}
                            style="stroke"
                            strokeWidth={strokeWidth}
                        />
                    ))}
                </Canvas>
            </View>
            <View style={styles.sideButtonsContainer}>
                <TouchableOpacity
                    onPress={undo}
                    style={[styles.button, styles.undoButton]}
                    accessibilityLabel="Undo"
                    accessibilityHint="Undo the last stroke"
                >
                    <FontAwesomeIcon icon={faUndo} size={30} color="#FF6347" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={redo}
                    style={[styles.button, styles.redoButton]}
                    accessibilityLabel="Redo"
                    accessibilityHint="Redo the last undone stroke"
                >
                    <FontAwesomeIcon icon={faRedo} size={30} color="#32CD32" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    canvas: {
        width: '100%', // Ocupa todo el ancho disponible del contenedor
        height: '100%', // Ocupa todo el alto disponible del contenedor
    },
    canvasContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#ccc',
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sideButtonsContainer: {
        alignItems: 'flex-end',
        marginRight: 16,
    },
    button: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
    },
    undoButton: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    redoButton: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    colorPickerButton: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Para darle un fondo semi-transparente al modal
    },
    pickerContainer: {
        width: 300,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    panelStyle: {
        height: 150,
        width: 250,
        marginBottom: 20,
    },
    sliderStyle: {
        width: 250,
        height: 40,
        marginBottom: 20,
    },
    swatchesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginBottom: 20,
    },
    swatchStyle: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    previewTxtContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default DrawableImage;
