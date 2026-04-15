import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SimpleTest() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800' }}>NEXIL</Text>
                <Text style={{ color: '#888', fontSize: 14, marginTop: 20 }}>Simple test - app is starting!</Text>
            </View>
        </SafeAreaView>
    );
}