import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { getApiErrorMessage } from '../../services/api';
import { AuthStackParamList } from '../../types/navigation';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { styles } from './Login.styles';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigation = useNavigation<LoginNavProp>();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (error) {
      const mensagem = getApiErrorMessage(
        error,
        'Credenciais inválidas ou não foi possível conectar ao servidor.'
      );
      Alert.alert('Erro na Autenticação', mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu e-mail cadastrado"
          placeholderTextColor="#7E758C"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua senha de acesso"
          placeholderTextColor="#7E758C"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <PrimaryButton
        title="Entrar"
        onPress={handleLogin}
        isLoading={isLoading}
      />

      <Pressable
        onPress={() => navigation.navigate('Cadastro')}
        style={({ pressed }) => [
          styles.registerPressable,
          pressed && styles.registerPressed,
        ]}
      >
        <Text style={styles.registerText}>
          Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
