import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers, faChartLine, faDollarSign } from '@fortawesome/free-solid-svg-icons';
//import { exportDatabase } from '../../services/database/exportDatabaseFunction';

const Dashboard = () => {

  // Datos quemados para los gráficos
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
      },
    ],
  };

  // Configuración del gráfico
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxContainer}>
        <View style={[styles.box, { backgroundColor: '#17a2b8' }]}>
          <View style={styles.inner}>
            <Text style={styles.boxText}>150</Text>
            <Text style={styles.boxText}>New Orders</Text>
          </View>
          <View style={styles.icon}>
            {/* Icono de bolsa o cualquier otro icono */}
          </View>
          <Text style={styles.link}>More info</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={350}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.stat, { backgroundColor: '#4CAF50' }]}>
          <FontAwesomeIcon icon={faUsers} size={30} color="#fff" />
          <Text style={styles.statValue}>120</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#FFC107', marginLeft: 10 }]}>
          <FontAwesomeIcon icon={faChartLine} size={30} color="#fff" />
          <Text style={styles.statValue}>$5,000</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#2196F3', marginLeft: 10 }]}>
          <FontAwesomeIcon icon={faDollarSign} size={30} color="#fff" />
          <Text style={styles.statValue}>$50,000</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    height: 120,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Añade sombra en Android
    shadowColor: '#000', // Añade sombra en iOS
    shadowOffset: { width: 0, height: 2 }, // Añade sombra en iOS
    shadowOpacity: 0.25, // Añade sombra en iOS
    shadowRadius: 3.84, // Añade sombra en iOS
    borderWidth: 1, // Agrega un borde
    borderColor: '#ddd', // Color del borde
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10, // Espacio adicional entre el icono y el valor
  },

  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  box: {
    width: '30%',
    height: 150,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  inner: {
    alignItems: 'center',
  },
  boxText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    alignItems: 'center',
  },
  link: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default Dashboard;
