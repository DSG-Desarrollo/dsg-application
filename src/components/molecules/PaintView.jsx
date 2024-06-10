import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function PaintView() {
    const [paths, setPaths] = useState([]);
    const path = useRef('');
    const svgRef = useRef();

    const handlePanResponderMove = (event, gestureState) => {
        const { moveX, moveY } = gestureState;
        const newPoint = `L${moveX},${moveY}`;
        path.current += newPoint;
        setPaths(prevPaths => [...prevPaths, newPoint]);
        svgRef.current.setNativeProps({ paths: [...paths, newPoint] });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: handlePanResponderMove,
            onPanResponderRelease: () => {
                path.current = '';
            },
        })
    ).current;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <Svg
                style={styles.svg}
                width={width}
                height={height}
                ref={svgRef}
            >
                <Path
                    d={`M0,0`}
                    stroke="black"
                    strokeWidth={3}
                    fill="none"
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    svg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
});
