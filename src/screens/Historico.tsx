import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { apiClient, api, setAuthToken } from '../api/apiConfig';

interface HistoricoItem {
  id: number;
  nome: string;
  dataConclusao: string;
  performedSeries: number;
  performedReps: number;
}

interface Section {
  title: string;
  data: HistoricoItem[];
}

const PRIMARY_COLOR = '#0776A0';
const BACKGROUND = '#f0f2f5';
const CARD_BACKGROUND = '#FFFFFF';

export default function Historico() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');
        setAuthToken(token);

        const res = await apiClient.get<HistoricoItem[]>(api.historico);
        const items = res.data.map(item => ({
          id: item.id,// @ts-ignore
          nome: item.exercicio.nome,// @ts-ignore
          dataConclusao: item.data,
          performedSeries: item.performedSeries,
          performedReps: item.performedReps,
        }));

        // Agrupa por dia
        const grouped = items.reduce<Record<string, HistoricoItem[]>>((acc, cur) => {
          const day = new Date(cur.dataConclusao).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          if (!acc[day]) acc[day] = [];
          acc[day].push(cur);
          return acc;
        }, {});

        const secs = Object.entries(grouped)
          .map(([title, data]) => ({ title, data }))
          .sort(
            (a, b) =>
              new Date(b.data[0].dataConclusao).getTime() -
              new Date(a.data[0].dataConclusao).getTime()
          );

        setSections(secs);
      } catch (error) {
        console.error('[Historico] erro:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar o histórico.'
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isFocused]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  if (sections.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color="#888" />
        <Text style={styles.emptyText}>Nenhum treino concluído</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.listContent}>
        {sections.map(section => (
          <View key={section.title} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{section.title}</Text>
            {section.data.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness-outline" size={20} color={PRIMARY_COLOR} />
                  <Text style={styles.cardTitle}>{item.nome}</Text>
                </View>
                <View style={styles.cardDetails}>
                  <Ionicons name="layers-outline" size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.detailText}>{item.performedSeries} séries</Text>
                  <Ionicons
                    name="repeat-outline"
                    size={16}
                    color={PRIMARY_COLOR}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>{item.performedReps} repetições</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    padding: 16,
  },
  dayContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    marginRight: 12,
    fontSize: 14,
    color: '#555',
  },
  detailIcon: {
    marginLeft: 8,
  },
});
