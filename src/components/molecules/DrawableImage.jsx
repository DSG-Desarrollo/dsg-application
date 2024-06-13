import React, { useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { StyleSheet, ImageBackground, View, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";
import {
    Canvas,
    Path,
    Skia,
    useTouchHandler,
    useCanvasRef, ImageFormat
} from "@shopify/react-native-skia";

/**
 * Componente que muestra una imagen de fondo y permite dibujar sobre ella en un lienzo.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {ImageSourcePropType} props.fixedImageSource - Fuente de la imagen fija que se muestra en el fondo.
 * @param {ImageSourcePropType} props.dynamicImageSource - Fuente de la imagen dinámica que se dibuja sobre la imagen fija.
 * @param {string} [props.strokeColor="red"] - Color del trazo al dibujar sobre la imagen.
 * @param {number} [props.strokeWidth=2] - Ancho del trazo al dibujar sobre la imagen.
 * @param {StyleProp<ViewStyle>} [props.imageStyle] - Estilo adicional para la imagen.
 * @param {StyleProp<ViewStyle>} [props.containerStyle] - Estilo adicional para el contenedor del componente.
 * @param {boolean} props.clearPaths - Bandera para borrar los trazos en el lienzo.
 * @param {function} props.onPathsCleared - Función de retorno de llamada para restablecer la bandera clearPaths.
 * @param {boolean} [props.blankCanvas=false] - Indica si el lienzo debe iniciarse en blanco sin imagen fija.
 * @param {Object} ref - Ref para exponer métodos al componente padre.
 * @returns {JSX.Element} Componente de imagen dibujable.
 */
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

    useEffect(() => {
        if (clearPaths) {
            setPaths([]);
            setUndonePaths([]);
            setHasDrawn(false); // Restablecer estado
            onPathsCleared(); // Llamar al callback para restablecer clearPaths
        }
    }, [clearPaths, onPathsCleared]);

    /**
     * Maneja el inicio de un nuevo trazo en el lienzo.
     *
     * @param {Object} touchInfo - Información del evento de toque.
     */
    const onDrawingStart = useCallback((touchInfo) => {
        const { x, y } = touchInfo;
        const newPath = Skia.Path.Make();
        newPath.moveTo(x, y);
        setPaths((old) => [...old, newPath]);
        setHasDrawn(true); // Actualizar estado
    }, []);

    /**
     * Maneja el dibujo activo en el lienzo mientras se arrastra el dedo.
     *
     * @param {Object} touchInfo - Información del evento de toque.
     */
    const onDrawingActive = useCallback((touchInfo) => {
        const { x, y } = touchInfo;
        setPaths((currentPaths) => {
            const updatedPaths = [...currentPaths];
            const currentPath = updatedPaths[updatedPaths.length - 1];
            currentPath.lineTo(x, y);
            return updatedPaths;
        });
    }, []);

    /**
     * Deshace el último trazo realizado en el lienzo.
     */
    const undo = useCallback(() => {
        setPaths((currentPaths) => {
            if (currentPaths.length === 0) return currentPaths;
            const updatedPaths = [...currentPaths];
            const undonePath = updatedPaths.pop();
            setUndonePaths((currentUndone) => [...currentUndone, undonePath]);
            return updatedPaths;
        });
    }, []);

    /**
     * Rehace el último trazo que fue deshecho.
     */
    const redo = useCallback(() => {
        setUndonePaths((currentUndone) => {
            if (currentUndone.length === 0) return currentUndone;
            const updatedUndone = [...currentUndone];
            const redonePath = updatedUndone.pop();
            setPaths((currentPaths) => [...currentPaths, redonePath]);
            return updatedUndone;
        });
    }, []);

    /**
     * Captura el contenido del lienzo en formato base64 y lo imprime en la consola.
     * Si no se puede capturar la imagen del lienzo, se imprime un mensaje de error.
     * 
     * @returns {Promise<string|null>} Base64 de la imagen capturada o null si falla.
     */
    const getCanvasBase64 = async () => {
        try {
            // Intenta obtener la imagen del lienzo
            const image = canvasRef.current?.makeImageSnapshot();

            // Verifica si se pudo obtener la imagen del lienzo
            if (image) {
                // Convierte la imagen a formato base64
                const base64 = await image.encodeToBase64(ImageFormat.PNG);
                // Imprime el base64 en la consola
                return base64;
                //console.log(base64);
            } else {
                // Imprime un mensaje de error si no se pudo obtener la imagen del lienzo
                console.log("No se pudo capturar la imagen del lienzo");
                return null;
            }
        } catch (error) {
            // Maneja cualquier excepción que pueda ocurrir
            console.error("Error al capturar la imagen del lienzo:", error);
            return null;
        }
    };

    /**
     * Hook de React que permite exponer métodos y propiedades al componente padre a través de un ref.
     * En este caso, se expone el método `captureCanvas` para capturar el contenido del lienzo en formato base64,
     * y la propiedad `hasDrawn` para indicar si se ha realizado algún dibujo en el lienzo.
     */
    useImperativeHandle(ref, () => ({
        captureCanvas: getCanvasBase64,
        hasDrawn
    }));

    /**
     * Hook de React Native Skia que maneja los eventos táctiles en el lienzo.
     * Se utiliza para gestionar el inicio y la continuación del dibujo.
     * `onStart` se llama cuando se inicia un nuevo trazo en el lienzo, y `onActive` se llama mientras se arrastra el dedo.
     */
    const touchHandler = useTouchHandler({
        onStart: onDrawingStart,
        onActive: onDrawingActive,
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {blankCanvas && (
                <View style={styles.canvasContainer}>
                    <Canvas ref={canvasRef} style={[styles.canvas]} onTouch={touchHandler}>
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
            )}
            {(fixedImageSource || dynamicImageSource) && (
                <ImageBackground
                    source={fixedImageSource || dynamicImageSource}
                    style={[styles.canvasContainer, imageStyle]}
                    resizeMode="contain"
                >
                    <Canvas ref={canvasRef} style={styles.canvas} onTouch={touchHandler}>
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
                </ImageBackground>
            )}
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
    canvasBorder: {
        borderWidth: 2,
        borderColor: 'black',
    },
    canvasPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
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
