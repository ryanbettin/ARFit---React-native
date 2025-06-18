import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import Navbar from './src/components/Navbar';


import Login from './src/screens/Login';
import Cadastro from './src/screens/Cadastro';


import AbdominalSupra from './src/exercicios/AbdominalSupra';
import Prancha from './src/exercicios/Prancha';
import ElevacaoDePernas from './src/exercicios/ElevacaoDePernas';
import RoscaDireta from './src/exercicios/RoscaDireta';
import RoscaMartelo from './src/exercicios/RoscaMartelo';
import RoscaConcentrada from './src/exercicios/RoscaConcentrada';
import RemadaCurvada from './src/exercicios/RemadaCurvada';
import PuxadaAlta from './src/exercicios/PuxadaAlta';
import LevantamentoTerra from './src/exercicios/LevantamentoTerra';
import DesenvolvimentoMilitar from './src/exercicios/DesenvolvimentoMilitar';
import ElevacaoLateral from './src/exercicios/ElevacaoLateral';
import RemadaAlta from './src/exercicios/RemadaAlta';
import SupinoReto from './src/exercicios/SupinoReto';
import Crucifixo from './src/exercicios/Crucifixo';
import FlexaoDeBraco from './src/exercicios/FlexaoDeBraco';
import Agachamento from './src/exercicios/Agachamento';
import LegPress from './src/exercicios/LegPress';
import CadeiraExtensora from './src/exercicios/CadeiraExtensora';
import TricepsTesta from './src/exercicios/TricepsTesta';
import TricepsCorda from './src/exercicios/TricepsCorda';
import Mergulho from './src/exercicios/Mergulho';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Autenticação */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />

        {/* Main Navigation (Tabs) */}
        <Stack.Screen name="Home" component={Navbar} />

        {/* Telas de Exercícios (Stack) */}
        <Stack.Screen name="AbdominalSupra" component={AbdominalSupra} />
        <Stack.Screen name="Prancha" component={Prancha} />
        <Stack.Screen name="ElevacaoDePernas" component={ElevacaoDePernas} />
        <Stack.Screen name="RoscaDireta" component={RoscaDireta} />
        <Stack.Screen name="RoscaMartelo" component={RoscaMartelo} />
        <Stack.Screen name="RoscaConcentrada" component={RoscaConcentrada} />
        <Stack.Screen name="RemadaCurvada" component={RemadaCurvada} />
        <Stack.Screen name="PuxadaAlta" component={PuxadaAlta} />
        <Stack.Screen name="LevantamentoTerra" component={LevantamentoTerra} />
        <Stack.Screen name="DesenvolvimentoMilitar" component={DesenvolvimentoMilitar} />
        <Stack.Screen name="ElevacaoLateral" component={ElevacaoLateral} />
        <Stack.Screen name="RemadaAlta" component={RemadaAlta} />
        <Stack.Screen name="SupinoReto" component={SupinoReto} />
        <Stack.Screen name="Crucifixo" component={Crucifixo} />
        <Stack.Screen name="FlexaoDeBraco" component={FlexaoDeBraco} />
        <Stack.Screen name="Agachamento" component={Agachamento} />
        <Stack.Screen name="LegPress" component={LegPress} />
        <Stack.Screen name="CadeiraExtensora" component={CadeiraExtensora} />
        <Stack.Screen name="TricepsTesta" component={TricepsTesta} />
        <Stack.Screen name="TricepsCorda" component={TricepsCorda} />
        <Stack.Screen name="Mergulho" component={Mergulho} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
