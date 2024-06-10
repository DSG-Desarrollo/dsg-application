import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TicketComments = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ticket Comments</Text>
            <Text>Comments related to the ticket.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default TicketComments;
