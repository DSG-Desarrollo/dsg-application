// ProfileScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import i18n from '../../../../i18n';
import { useDatabase } from '../../../context/DatabaseContext';

const ProfileScreen = () => {
  const { executeSql } = useDatabase();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Función para obtener los usuarios de la base de datos al cargar el componente
    const getUsers = async () => {
      try {
        // Consulta SQL para seleccionar todos los usuarios de la tabla user
        const query = 'SELECT * FROM user';
        // Ejecuta la consulta SQL
        const result = await executeSql(query);
        console.log("Select de la tabla user", result);
        // Actualiza el estado con los resultados de la consulta
        setUsers(result);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    // Llama a la función para obtener los usuarios al cargar el componente
    getUsers();
  }, [executeSql]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('profileScreen')}</Text>
      <View>
        {users && users.length > 0 ? (
          users.map(user => (
            <View key={user.employee_id}>
              <Text>Employee ID: {user.employee_id}</Text>
              <Text>Observation: {user.observation}</Text>
              <Text>User ID: {user.user_id}</Text>
              <Text>User Registration: {user.user_registration}</Text>
              <Text>User Status: {user.user_status}</Text>
              {/* Renderiza otros campos del usuario según sea necesario */}
            </View>
          ))
        ) : (
          <Text>No se encontraron usuarios.</Text>
        )}
      </View>
      <Text>This is your profile information.</Text>
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

export default ProfileScreen;
