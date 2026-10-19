import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/api';
import { AuthStackParamList } from '../../types/navigation';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { styles } from './TelaVerificacaoTokens.styles';

type VerificacaoTokenNavProp = NativeStackNavigationProp<AuthStackParamList, 'VerificacaoToken'>;
type VerificacaoTokenRouteProp = RouteProp<AuthStackParamList, 'VerificacaoToken'>;

export function TelaVerificacaoToken() {
  const navigation = useNavigation<VerificacaoTokenNavProp>();
  const route = useRoute<VerificacaoTokenRouteProp>();

  const telefone = route.params?.telefone || '';
  const email = route.params?.email || '';

  const [codigo, setCodigo] = useState<string[]>(['', '', '', '', '', '']);
  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const formatarTelefoneExibicao = (num: string) => {
    if (!num) return '';
    const limpo = num.replace(/\D/g, '');
    if (limpo.length >= 12) {
      const ddi = limpo.slice(0, 2);
      const ddd = limpo.slice(2, 4);
      const p1 = limpo.slice(4, 9);
      const p2 = limpo.slice(9);
      return `+${ddi} (${ddd}) ${p1}-${p2}`;
    }
    return num;
  };

  const lidarMudancaDigito = (texto: string, indice: number) => {
    const apenasNumero = texto.replace(/\D/g, '');
    const novoCodigo = [...codigo];
    novoCodigo[indice] = apenasNumero;
    setCodigo(novoCodigo);

    if (apenasNumero && indice < 5) {
      inputsRef.current[indice + 1]?.focus();
    }
  };

  const lidarPressionarTecla = (e: any, indice: number) => {
    if (e.nativeEvent.key === 'Backspace' && !codigo[indice] && indice > 0) {
      inputsRef.current[indice - 1]?.focus();
    }
  };

  const handleConfirmar = async () => {
    const tokenCompleto = codigo.join('');

    if (tokenCompleto.length < 6) {
      Alert.alert('Atenção', 'Digite o código de 6 dígitos completo.');
      return;
    }

    setCarregando(true);

    try {
      await authService.verifySms({
        phone: telefone,
        code: tokenCompleto,
      });

      Alert.alert('Sucesso', 'Token validado com sucesso!', [
        {
          text: 'Ir para o Login',
          onPress: () => navigation.navigate('Login', email ? { email } : undefined),
        },
      ]);
    } catch (erro: any) {
      const mensagem = getApiErrorMessage(
        erro,
        'Código incorreto ou expirado. Tente novamente.'
      );
      Alert.alert('Falha na Validação', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviando(true);
    try {
      await authService.sendSms({ phone: telefone });
      Alert.alert('Enviado', 'Um novo código foi enviado por SMS.');
    } catch (erro: any) {
      const mensagem = getApiErrorMessage(
        erro,
        'Não foi possível reenviar o SMS no momento.'
      );
      Alert.alert('Erro ao Reenviar', mensagem);
    } finally {
      setReenviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.titulo}>Verificação{'\n'}de Token</Text>
        <Text style={styles.subtitulo}>
          Digite o código de 6 dígitos enviado por SMS
          {telefone ? (
            <>
              {'\n'}para{' '}
              <Text style={{ fontWeight: '700', color: '#6B21A8' }}>
                {formatarTelefoneExibicao(telefone)}
              </Text>
            </>
          ) : null}
        </Text>

        <View style={styles.codigoContainer}>
          {codigo.map((digito, indice) => (
            <TextInput
              key={indice}
              ref={(ref) => {
                inputsRef.current[indice] = ref;
              }}
              style={[
                styles.campoDigito,
                digito ? styles.campoDigitoPreenchido : null,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digito}
              placeholder="-"
              placeholderTextColor="#9CA3AF"
              onChangeText={(texto) => lidarMudancaDigito(texto, indice)}
              onKeyPress={(e) => lidarPressionarTecla(e, indice)}
            />
          ))}
        </View>

        <Pressable
          onPress={handleReenviarCodigo}
          style={({ pressed }) => [styles.botaoReenviar, pressed && styles.botaoReenviarPressed]}
          disabled={reenviando}
        >
          {reenviando ? (
            <ActivityIndicator size="small" color="#6B21A8" />
          ) : (
            <Text style={styles.textoReenviar}>Reenviar Código</Text>
          )}
        </Pressable>

        <PrimaryButton
          title="Confirmar"
          onPress={handleConfirmar}
          isLoading={carregando}
          style={styles.botaoConfirmar}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
