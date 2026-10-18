import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { AuthStackParamList } from '../types/navigation';
import { PrimaryButton } from '../components/PrimaryButton';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigation = useNavigation<LoginNavProp>();
  const insets = useSafeAreaInsets();

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
      // Com AuthContext gerenciando o token, a troca para as rotas autenticadas ocorre automaticamente!
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
    <View style={[styles.container, { paddingBottom: 24 + insets.bottom }]}>
      <Image
        source={require('../../assets/logo.png')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 140,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#E9D5FF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  registerPressable: {
    marginTop: 20,
    alignItems: 'center',
    padding: 8,
  },
  registerPressed: {
    opacity: 0.6,
  },
  registerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#4B0082',
    fontWeight: 'bold',
  },
});