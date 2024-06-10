import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const CustomScrollView = ({ children, style }) => {
    return (
        <ScrollView
            contentContainerStyle={[styles.container, style]}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
});

export default CustomScrollView;
