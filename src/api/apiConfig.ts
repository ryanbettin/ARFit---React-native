import axios from 'axios';

export const BASE_URL = 'http://192.168.1.14:3333';

export const api = {
  cadastro:          '/auth/cadastrar',
  login:             '/auth/login',
  grupos:            '/grupos',
  exerciciosPorGrupo:(id: number) => `/grupos/${id}/exercicios`,
  historico:         '/historico',
  metas:             '/metas',
  usuario:           '/usuario',  
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});


export function setAuthToken(token: string) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
