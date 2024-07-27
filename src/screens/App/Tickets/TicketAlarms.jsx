import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TicketAlarms = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ticket Alarms</Text>
            <Text>Alarms related to the ticket.</Text>
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

export default TicketAlarms;
