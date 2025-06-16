import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { apiClient, api } from '../api/apiConfig';

// @ts-ignore
import logo from '../../assets/logo.png';

// Tipagens
interface Exercicio { id: number; nome: string; grupoId: number; }
interface Grupo { id: number; nome: string; exercicios: Exercicio[]; }

const PRIMARY_COLOR = '#0776A0';
const BACKGROUND = '#f0f2f5';
const CARD_BACKGROUND = '#FFFFFF';

/**
 * Normaliza, remove acentos e converte para PascalCase:
 * "Elevação de Pernas" → "ElevacaoDePernas"
 */
function formatRouteName(name: string) {
  return name
    .normalize('NFD')                              // separa diacríticos
    .replace(/[\u0300-\u036f]/g, '')               // remove acentos
    .split(/\s+/)                                  // separa em palavras
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // capitaliza cada palavra
    .join('');                                     // junta sem espaços
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<Grupo[]>(api.grupos);
        setGrupos(res.data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao carregar grupos.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleGroup = (id: number) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.intro}>Selecione o grupo muscular!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {grupos.map(grupo => (
          <View key={grupo.id} style={styles.groupContainer}>
            <TouchableOpacity
              style={styles.groupHeader}
              onPress={() => toggleGroup(grupo.id)}
              activeOpacity={0.7}
            >
              <View style={styles.groupTitleWrap}>
                <Ionicons name="barbell-outline" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.groupTitle}>{grupo.nome}</Text>
              </View>
              <Ionicons
                name={expanded.includes(grupo.id) ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={PRIMARY_COLOR}
              />
            </TouchableOpacity>

            {expanded.includes(grupo.id) && (
              <View style={styles.exList}>
                <View style={styles.selectWrap}>
                  <Ionicons name="list-outline" size={16} color='#555' />
                  <Text style={styles.selectTitle}>Selecione o treino</Text>
                </View>
                {grupo.exercicios.map(ex => (
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.exCard}
                    onPress={() => navigation.navigate(formatRouteName(ex.nome))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exName}>{ex.nome}</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: BACKGROUND },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND },
  header: {
    padding: 20,
    backgroundColor: CARD_BACKGROUND,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 8 },
  intro: { fontSize: 18, color: PRIMARY_COLOR, fontWeight: '600' },
  content: { padding: 16 },
  groupContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
    elevation: 2
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12
  },
  groupTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  groupTitle: { marginLeft: 8, fontSize: 18, fontWeight: '700', color: '#333' },
  exList: { paddingHorizontal: 12, paddingBottom: 12 },
  selectWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  selectTitle: { marginLeft: 4, fontSize: 14, color: '#555', fontWeight: '600' },
  exCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8
  },
  exName: { fontSize: 16, color: '#333' },
});
