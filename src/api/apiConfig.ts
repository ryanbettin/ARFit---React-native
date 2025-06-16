// src/api/apiConfig.ts
import axios from 'axios';

export const BASE_URL = 'http://192.168.68.55:3333';

export const api = {
  cadastro:          '/auth/cadastrar',
  login:             '/auth/login',
  grupos:            '/grupos',
  exerciciosPorGrupo:(id: number) => `/grupos/${id}/exercicios`,
  historico:         '/historico',
  metas:             '/metas',
  usuario:           '/usuario',  // rota para obter perfil do usuário autenticado
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Chame setAuthToken(token) logo após o login para injetar o header
export function setAuthToken(token: string) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
