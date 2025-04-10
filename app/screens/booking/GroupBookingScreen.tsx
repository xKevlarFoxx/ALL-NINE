import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

interface GroupBooking {
  serviceName: string;
  participants: string[];
  date: string;
}

export const GroupBookingScreen = () => {
  const [groupBooking, setGroupBooking] = useState<GroupBooking>({
    serviceName: '',
    participants: [],
    date: '',
  });
  const [participantName, setParticipantName] = useState('');

  const addParticipant = () => {
    if (participantName.trim() === '') {
      alert('Participant name cannot be empty.');
      return;
    }
    setGroupBooking(prev => ({
      ...prev,
      participants: [...prev.participants, participantName],
    }));
    setParticipantName('');
  };

  const handleBooking = () => {
    if (!groupBooking.serviceName || !groupBooking.date || groupBooking.participants.length === 0) {
      alert('Please fill out all fields and add at least one participant.');
      return;
    }
    console.log('Group booking confirmed:', groupBooking);
    alert('Group booking confirmed!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Booking</Text>

      <TextInput
        style={styles.input}
        placeholder="Service Name"
        value={groupBooking.serviceName}
        onChangeText={text => setGroupBooking(prev => ({ ...prev, serviceName: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={groupBooking.date}
        onChangeText={text => setGroupBooking(prev => ({ ...prev, date: text }))}
      />

      <Text style={styles.sectionTitle}>Participants</Text>
      <FlatList
        data={groupBooking.participants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.participant}>{item}</Text>}
      />

      <TextInput
        style={styles.input}
        placeholder="Participant Name"
        value={participantName}
        onChangeText={setParticipantName}
      />
      <Button title="Add Participant" onPress={addParticipant} />

      <Button title="Confirm Booking" onPress={handleBooking} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  participant: {
    fontSize: 16,
    marginBottom: 4,
  },
});