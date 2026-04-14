import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';

export default function ConnectivityStorage() {
  const [networkType, setNetworkType] = useState('Checking...');
  const [ipAddress, setIpAddress] = useState('--');
  const [freeSpace, setFreeSpace] = useState<string>('--');
  const [clipboardContent, setClipboardContent] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Network info
        const network = await Network.getNetworkStateAsync();
        setNetworkType(network.type || 'UNKNOWN');
        const ip = await Network.getIpAddressAsync();
        setIpAddress(ip);

        // Storage info
        const free = await FileSystem.getFreeDiskStorageAsync();
        setFreeSpace((free / (1024 * 1024 * 1024)).toFixed(1)); // Convert to GB

        // Clipboard initial
        const text = await Clipboard.getStringAsync();
        setClipboardContent(text);
      } catch (error) {
        console.warn('ConnectivityStorage error:', error);
      }
    })();
  }, []);

  const clearClipboard = async () => {
    await Clipboard.setStringAsync('');
    setClipboardContent('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CONNECTIVITY & STORAGE</Text>
      
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>NETWORK</Text>
          <Text style={styles.value}>{networkType}</Text>
          <Text style={styles.subValue}>{ipAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>FREE STORAGE</Text>
          <Text style={styles.value}>{freeSpace} GB</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} /> 
          </View>
        </View>

        <View style={[styles.card, { width: '100%' }]}>
          <Text style={styles.label}>CLIPBOARD</Text>
          <Text style={styles.clipboardText} numberOfLines={1}>
            {clipboardContent || 'Empty'}
          </Text>
          <TouchableOpacity onPress={clearClipboard} style={styles.clearBtn}>
            <Text style={styles.clearText}>CLEAR CLIPBOARD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15, color: '#000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#F9F9F9', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 8 },
  value: { fontSize: 16, fontWeight: '700', color: '#000' },
  subValue: { fontSize: 10, color: '#999', marginTop: 4 },
  progressBar: { width: '100%', height: 4, backgroundColor: '#EEE', borderRadius: 2, marginTop: 10 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  clipboardText: { fontSize: 13, color: '#444', fontStyle: 'italic', marginBottom: 10 },
  clearBtn: { backgroundColor: '#000', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start' },
  clearText: { color: '#FFF', fontSize: 9, fontWeight: '800' }
});
