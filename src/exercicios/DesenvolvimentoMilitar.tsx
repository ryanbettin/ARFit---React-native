import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { apiClient, api, setAuthToken } from '../api/apiConfig';

// @ts-ignore
import exerciseImage from '../../assets/treinos/DesenvolvimentoMilitar.png';

const PRIMARY_COLOR = '#0776A0';
const BACKGROUND = '#FFFFFF';
const EXERCISE_ID = 16;

export default function DesenvolvimentoMilitarScreen() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');

  const openModal = () => {
    setStep(1);
    setSeries('');
    setReps('');
    setModalVisible(true);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!series) {
        Toast.show({ type: 'error', text1: 'Atenção', text2: 'Informe a quantidade de séries.' });
        return;
      }
      setStep(2);
    } else {
      if (!reps) {
        Toast.show({ type: 'error', text1: 'Atenção', text2: 'Informe a quantidade de repetições.' });
        return;
      }
      try {
        setModalVisible(false);
       
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');
       
        setAuthToken(token);
        
        await apiClient.post(api.historico, {
          exercicioId: EXERCISE_ID,
          performedSeries: parseInt(series, 10),
          performedReps: parseInt(reps, 10),
        });
       
        Toast.show({
          type: 'success',
          text1: 'Concluído',
          text2: `${series} séries de ${reps} repetições registradas!`
        });
        navigation.navigate('Home', { screen: 'Histórico' });
      } catch (error) {
        console.error('[DesenvolvimentoMilitarScreen] erro:', error);
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível registrar o exercício.' });
      }
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
          <Ionicons name="chevron-back" size={24} color={BACKGROUND} />
        </TouchableOpacity>
        <Text style={styles.title}>Desenvolvimento Militar</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={exerciseImage} style={styles.image} />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            O Desenvolvimento Militar é um exercício de empurrão vertical que trabalha principalmente os deltoides
            (parte anterior e medial), além de envolver trapézio e tríceps. Geralmente realizado com barra ou halteres
            sentado ou em pé, melhora a força e estabilidade dos ombros e core, sendo ideal para ganhos de massa
            e resistência muscular.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={openModal} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Concluído</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {step === 1 ? 'Quantas séries?' : 'Quantas repetições?'}
            </Text>
            <TextInput
              placeholder={step === 1 ? 'Insira número de séries' : 'Insira número de repetições'}
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.modalInput}
              value={step === 1 ? series : reps}
              onChangeText={text => (step === 1 ? setSeries(text) : setReps(text))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, styles.modalCancel]}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={[styles.modalButton, styles.modalNext]}>
                <Text style={styles.modalNextText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: PRIMARY_COLOR,
  },
  backButtonContainer: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: BACKGROUND,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  imageContainer: {
    marginBottom: 24,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 1,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    margin: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  buttonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: BACKGROUND,
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  modalCancel: {
    backgroundColor: '#ccc',
  },
  modalNext: {
    backgroundColor: PRIMARY_COLOR,
  },
  modalCancelText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalNextText: {
    textAlign: 'center',
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
});
