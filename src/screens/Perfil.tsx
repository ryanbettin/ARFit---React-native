// src/screens/Perfil.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { apiClient, api, setAuthToken } from '../api/apiConfig';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const STAT_CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - 24) / 3; // 24 = gap between cards

interface Usuario {
  nome: string;
  email: string;
}

export default function Perfil({ navigation }: any) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // stats
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [totalMetasDone, setTotalMetasDone] = useState(0);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');
      setAuthToken(token);

      const [uRes, hRes, mRes] = await Promise.all([
        apiClient.get<Usuario>(api.usuario),
        apiClient.get(api.historico),
        apiClient.get(api.metas),
      ]);

      setUsuario(uRes.data);
      const history = hRes.data;
      setTotalExercises(history.length);
      setTotalReps(history.reduce((sum: number, h: any) => sum + (h.performedReps || 0), 0));

      const metas = mRes.data;
      const doneCount = metas.filter((meta: any) =>
        meta.exercicios.every((me: any) => {
          const sinceTs = new Date(meta.createdAt).getTime();
          return history.some((h: any) =>
            h.exercicioId === me.exercicio.id &&
            new Date(h.data).getTime() >= sinceTs &&
            h.performedSeries >= me.targetSeries &&
            h.performedReps >= me.targetReps
          );
        })
      ).length;
      setTotalMetasDone(doneCount);

    } catch (err: any) {
      console.error('Perfil error:', err);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token','usuarioId']);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0776A0" />
      </SafeAreaView>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <Text style={styles.errorText}>Dados de usuário indisponíveis.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{usuario.nome}</Text>
            <Text style={styles.userEmail}>{usuario.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={24} color="#0776A0" />
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Exercícios</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="repeat" size={24} color="#0776A0" />
            <Text style={styles.statValue}>{totalReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-circle" size={24} color="#0776A0" />
            <Text style={styles.statValue}>{totalMetasDone}</Text>
            <Text style={styles.statLabel}>Metas</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING
  },
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 20,
    paddingBottom: 40
  },

  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#0776A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
