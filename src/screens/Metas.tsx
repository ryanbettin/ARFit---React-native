import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { apiClient, api, setAuthToken } from '../api/apiConfig';

type Exercicio = { id: number; nome: string };
type MetaExercicio = { exercicio: Exercicio; targetSeries: number; targetReps: number; targetPeso: number };
type Meta = { id: number; nome: string; createdAt: string; exercicios: MetaExercicio[] };
type HistoricoEntry = { exercicioId: number; performedSeries: number; performedReps: number; data: string };
type MetaExercicioInput = { id: number; targetSeries: number; targetReps: number; targetPeso: number };

const COLORS = {
  primary: '#0776A0',
  background: '#f0f2f5',
  card: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  selected: '#E0F2FE'
};
const SPACING = 16;
const { width } = Dimensions.get('window');

export default function MetasScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Dados
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  // Criação de meta
  const [showCreate, setShowCreate] = useState(false);
  const [nomeMeta, setNomeMeta] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [targets, setTargets] = useState<Record<number, { series: string; reps: string; peso: string }>>({});

  // Visualização de meta
  const [activeMeta, setActiveMeta] = useState<Meta | null>(null);

  const configureAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    setAuthToken(token);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await configureAuth();
      const [hRes, mRes, gRes] = await Promise.all([
        apiClient.get<HistoricoEntry[]>(api.historico),
        apiClient.get<Meta[]>(api.metas),
        apiClient.get<{ exercicios: Exercicio[] }[]>(api.grupos),
      ]);
      setHistorico(hRes.data);
      setMetas(mRes.data);
      setExercicios(gRes.data.flatMap(g => g.exercicios));
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao carregar dados.' });
    } finally {
      setLoading(false);
    }
  }, [configureAuth]);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused, loadData]);

  // Filtra exercícios
  const filteredEx = useMemo(
    () => exercicios.filter(e => e.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [exercicios, searchTerm]
  );

  // Verifica conclusão
  const isDone = useCallback(
    (me: MetaExercicio, since: string) => {
      const sinceTs = new Date(since).getTime();
      return historico.some(h =>
        h.exercicioId === me.exercicio.id &&
        new Date(h.data).getTime() >= sinceTs &&
        h.performedSeries >= me.targetSeries &&
        h.performedReps >= me.targetReps
      );
    },
    [historico]
  );

  // Seleciona/exclui exercício
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setTargets(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Cria meta
  const handleCreate = async () => {
    if (!nomeMeta.trim() || selectedIds.length === 0) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Informe nome e ao menos um exercício.' });
      return;
    }
    const payload: MetaExercicioInput[] = selectedIds.map(id => ({
      id,
      targetSeries: parseInt(targets[id]?.series || '0', 10),
      targetReps: parseInt(targets[id]?.reps || '0', 10),
      targetPeso: parseFloat(targets[id]?.peso || '0'),
    }));
    try {
      await configureAuth();
      await apiClient.post(api.metas, { nome: nomeMeta, exercicios: payload });
      Toast.show({ type: 'success', text1: 'Meta criada', text2: nomeMeta });
      setShowCreate(false);
      setNomeMeta('');
      setSearchTerm('');
      setSelectedIds([]);
      setTargets({});
      loadData();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao criar meta.' });
    }
  };

  // Renderiza card de lista
  const renderCard = ({ item }: { item: Meta }) => {
    const doneAll = item.exercicios.every(me => isDone(me, item.createdAt));
    return (
      <TouchableOpacity style={styles.card} onPress={() => setActiveMeta(item)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Ionicons
            name={doneAll ? 'checkmark-done-circle' : 'time-outline'}
            size={20}
            color={doneAll ? COLORS.success : COLORS.textSecondary}
          />
        </View>
        <Text style={styles.cardDate}>
          Criada em {new Intl.DateTimeFormat('pt-BR').format(new Date(item.createdAt))}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={metas}
        keyExtractor={m => String(m.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
      />

      {/* FAB “Nova Meta” */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle" size={28} color="#fff" />
        <Text style={styles.fabText}>Nova Meta</Text>
      </TouchableOpacity>

      {/* Modal Criar Meta */}
      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={styles.centeredOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <View style={styles.modalContainer}>
              <View style={styles.accentBar}/>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Meta</Text>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Ionicons name="close-outline" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Nome da meta"
                placeholderTextColor={COLORS.textSecondary}
                value={nomeMeta}
                onChangeText={setNomeMeta}
                style={[styles.input, { borderColor: COLORS.primary, color: COLORS.textPrimary }]}
              />

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  placeholder="Buscar exercício"
                  placeholderTextColor={COLORS.textSecondary}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  style={[styles.searchInput, { color: COLORS.textPrimary }]}
                />
              </View>

              <ScrollView style={styles.exList}>
                {filteredEx.map(ex => {
                  const sel = selectedIds.includes(ex.id);
                  return (
                    <View key={ex.id} style={styles.exRow}>
                      <TouchableOpacity
                        style={[styles.exItem, sel && styles.exItemSel]}
                        onPress={() => toggleSelect(ex.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="fitness-outline"
                          size={20}
                          color={sel ? COLORS.primary : COLORS.textPrimary}
                        />
                        <Text style={styles.exText}>{ex.nome}</Text>
                        {sel && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={COLORS.primary}
                          />
                        )}
                      </TouchableOpacity>

                      {sel && (
                        <View style={styles.targetsRow}>
                          <View style={styles.inputWithIcon}>
                            <Ionicons name="barbell-outline" size={20} color={COLORS.primary} />
                            <TextInput
                              placeholder="Séries"
                              placeholderTextColor={COLORS.textSecondary}
                              keyboardType="number-pad"
                              style={[styles.smallInput, { color: COLORS.textPrimary }]}
                              value={targets[ex.id]?.series}
                              onChangeText={text =>
                                setTargets(prev => ({
                                  ...prev,
                                  [ex.id]: { ...(prev[ex.id] || {}), series: text }
                                }))
                              }
                            />
                          </View>
                          <View style={styles.inputWithIcon}>
                            <Ionicons name="repeat-outline" size={20} color={COLORS.primary} />
                            <TextInput
                              placeholder="Reps"
                              placeholderTextColor={COLORS.textSecondary}
                              keyboardType="number-pad"
                              style={[styles.smallInput, { color: COLORS.textPrimary }]}
                              value={targets[ex.id]?.reps}
                              onChangeText={text =>
                                setTargets(prev => ({
                                  ...prev,
                                  [ex.id]: { ...(prev[ex.id] || {}), reps: text }
                                }))
                              }
                            />
                          </View>
                          <View style={styles.inputWithIcon}>
                            <Ionicons name="scale-outline" size={20} color={COLORS.primary} />
                            <TextInput
                              placeholder="Peso (kg)"
                              placeholderTextColor={COLORS.textSecondary}
                              keyboardType="decimal-pad"
                              style={[styles.smallInput, { color: COLORS.textPrimary }]}
                              value={targets[ex.id]?.peso}
                              onChangeText={text =>
                                setTargets(prev => ({
                                  ...prev,
                                  [ex.id]: { ...(prev[ex.id] || {}), peso: text }
                                }))
                              }
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowCreate(false)}>
                  <Ionicons name="close-outline" size={20} color={COLORS.error} />
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleCreate}>
                  <Ionicons name="checkmark-outline" size={20} color="#fff" />
                  <Text style={styles.btnSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal Visualizar Meta */}
      {activeMeta && (
        <Modal
          visible
          transparent
          animationType="fade"
          presentationStyle="overFullScreen"
          onRequestClose={() => setActiveMeta(null)}
        >
          <View style={styles.centeredOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.accentBar}/>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activeMeta.nome}</Text>
                <TouchableOpacity onPress={() => setActiveMeta(null)}>
                  <Ionicons name="close-outline" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={activeMeta.exercicios}
                keyExtractor={me => String(me.exercicio.id)}
                renderItem={({ item }) => {
                  const done = isDone(item, activeMeta.createdAt);
                  return (
                    <View style={styles.exRow}>
                      <View style={[styles.exItem, styles.viewItem]}>
                        <Text style={styles.exText}>{item.exercicio.nome}</Text>
                        <Ionicons
                          name={done ? 'checkmark-done-circle' : 'ellipse-outline'}
                          size={20}
                          color={done ? COLORS.success : COLORS.textSecondary}
                        />
                      </View>
                      <Text style={styles.viewSub}>
                        Alvo: {item.targetSeries}×{item.targetReps} • Peso: {item.targetPeso}kg
                      </Text>
                    </View>
                  );
                }}
                contentContainerStyle={{ paddingBottom: SPACING }}
              />
            </View>
          </View>
        </Modal>
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING },

  card: {
    backgroundColor: COLORS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING,
    marginBottom: SPACING / 2,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING / 4 },
  cardTitle: { flex: 1, marginLeft: SPACING / 2, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  cardDate: { fontSize: 12, color: COLORS.textSecondary },

  fab: {
    position: 'absolute',
    right: SPACING,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingVertical: SPACING / 2,
    borderRadius: 30,
    elevation: 8,
    zIndex: 1000
  },
  fabText: { color: '#fff', fontSize: 16, marginLeft: SPACING / 2 },

  centeredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING
  },
  modalWrapper: { width: '100%', alignItems: 'center' },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingTop: SPACING * 2,
    paddingHorizontal: SPACING,
    paddingBottom: SPACING,
    elevation: 5
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary
  },

  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: SPACING / 2, marginBottom: SPACING },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: SPACING / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING
  },
  searchInput: { flex: 1, marginLeft: SPACING / 2, paddingVertical: 0 },

  exList: { maxHeight: 240, marginBottom: SPACING },
  exRow: { marginBottom: SPACING / 2 },
  exItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING / 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  exItemSel: { backgroundColor: COLORS.selected, borderColor: COLORS.primary },
  exText: { flex: 1, marginLeft: SPACING / 2, fontSize: 16, color: COLORS.textPrimary },

  targetsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING / 4 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: SPACING / 3,
    marginHorizontal: SPACING / 4
  },
  smallInput: { flex: 1, padding: SPACING / 4, marginLeft: SPACING / 3 },

  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING },
  btnCancel: { flexDirection: 'row', alignItems: 'center', padding: SPACING / 2 },
  btnCancelText: { color: COLORS.error, fontSize: 16, marginLeft: SPACING / 4 },
  btnSave: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: SPACING / 2, borderRadius: 6 },
  btnSaveText: { color: '#fff', fontSize: 16, marginLeft: SPACING / 4 },

  viewSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING / 4 }
});
