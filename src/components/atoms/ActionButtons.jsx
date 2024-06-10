import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import PropTypes from 'prop-types';

const ActionButtons = ({ buttons, buttonContainerStyle, buttonStyle, buttonTextStyle }) => {
    return (
        <View style={[styles.buttonContainer, buttonContainerStyle]}>
            {buttons.map((button, index) => (
                <Pressable
                    key={index}
                    style={[styles.button, buttonStyle]}
                    onPress={button.onPress}
                >
                    <FontAwesomeIcon icon={button.icon} size={30} color="#007bff" />
                    <Text style={[styles.buttonText, buttonTextStyle]}>{button.text}</Text>
                </Pressable>
            ))}
        </View>
    );
};

ActionButtons.propTypes = {
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            icon: PropTypes.object.isRequired,
            onPress: PropTypes.func.isRequired,
        })
    ).isRequired,
    buttonContainerStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    buttonTextStyle: PropTypes.object,
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
    },
    buttonText: {
        marginLeft: 10,
        color: '#007bff',
        fontSize: 16,
    },
});

export default ActionButtons;
