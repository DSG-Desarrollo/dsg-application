import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet, View } from 'react-native';

const SelectManager = ({
    data,
    onValueChange,
    value,
    placeholder,
    style,
    pickerProps,
    labelKey = 'label',
    valueKey = 'value',
    displayKey,
    formatOptionLabel,
    customLabelComponent,
    ...props
}) => {
    const renderLabel = (item) => {
        if (customLabelComponent) {
            return React.createElement(customLabelComponent, { item });
        } else if (formatOptionLabel) {
            return formatOptionLabel(item);
        } else if (displayKey) {
            return item[displayKey];
        } else {
            return item[labelKey];
        }
    };

    const formattedData = data.map((item) => ({
        label: renderLabel(item),
        value: item[valueKey],
    }));

    return (
        <View style={[styles.container, style]}>
            <RNPickerSelect
                onValueChange={onValueChange}
                items={formattedData}
                value={value}
                placeholder={placeholder}
                style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                        top: 12,
                        right: 10,
                    },
                }}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 10,
        color: '#333',
        paddingRight: 30, // to ensure the text is never behind the icon
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 10,
        color: '#333',
        paddingRight: 30, // to ensure the text is never behind the icon
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        top: 10,
        right: 12,
    },
});

export default SelectManager;
