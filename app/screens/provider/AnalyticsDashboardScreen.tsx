import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis } from 'victory-native';

export const AnalyticsDashboardScreen = () => {
  const [analyticsData, setAnalyticsData] = useState({
    bookingTrends: [],
    revenueBreakdown: [],
    customerRetention: [],
  });

  useEffect(() => {
    // Mock analytics data
    setAnalyticsData({
      bookingTrends: [
        { x: 'Mon', y: 10 },
        { x: 'Tue', y: 15 },
        { x: 'Wed', y: 20 },
        { x: 'Thu', y: 25 },
        { x: 'Fri', y: 30 },
      ],
      revenueBreakdown: [
        { x: 'Service A', y: 40 },
        { x: 'Service B', y: 30 },
        { x: 'Service C', y: 20 },
        { x: 'Service D', y: 10 },
      ],
      customerRetention: [
        { x: 'New', y: 60 },
        { x: 'Returning', y: 40 },
      ],
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics Dashboard</Text>

      <Text style={styles.sectionTitle}>Booking Trends</Text>
      <VictoryChart domainPadding={20}>
        <VictoryAxis />
        <VictoryAxis dependentAxis />
        <VictoryBar data={analyticsData.bookingTrends} />
      </VictoryChart>

      <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
      <VictoryPie data={analyticsData.revenueBreakdown} colorScale={['#4caf50', '#2196f3', '#ff9800', '#f44336']} />

      <Text style={styles.sectionTitle}>Customer Retention</Text>
      <VictoryPie data={analyticsData.customerRetention} colorScale={['#2196f3', '#ff9800']} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
});