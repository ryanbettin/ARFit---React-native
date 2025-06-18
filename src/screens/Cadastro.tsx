import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, api } from '../api/apiConfig';
import Toast from 'react-native-toast-message';

// @ts-ignore
import logo from '../../assets/logo.png';

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos.'
      });
      return;
    }
    if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'As senhas não coincidem.'
      });
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(api.cadastro, { nome, email, senha });
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Cadastro realizado com sucesso!'
      });
      navigation.navigate('Login');
    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Erro ao cadastrar usuário.';
      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>Cadastro</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Digite seu email"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            placeholder="Repita sua senha"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCadastro}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.registerText}>Já tem conta? Faça login</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const PRIMARY_COLOR = '#0776A0';
const BACKGROUND_COLOR = '#FFFFFF';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 0
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 24
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333'
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd'
  },
  buttonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center'
  },
  registerButton: {
    marginTop: 16,
    alignSelf: 'center'
  },
  registerText: {
    color: PRIMARY_COLOR,
    fontSize: 14
  }
});
