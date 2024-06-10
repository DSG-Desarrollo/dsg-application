// TicketDetails.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TicketDetails = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ticket Details!</Text>
      <Text>Details of a specific ticket will be shown here.</Text>
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

export default TicketDetails;
