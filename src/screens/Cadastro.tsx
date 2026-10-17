import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { Role } from '../types';
import { AuthStackParamList } from '../types/navigation';
import { PAISES, Pais } from '../constants/paises';
import { SeletorPais } from '../components/SeletorPais';
import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from './Cadastro.style';

interface CargoItem {
  chave: Role;
  rotulo: string;
}

const CARGOS: CargoItem[] = [
  { chave: Role.PROJETISTA, rotulo: 'Projetista' },
  { chave: Role.CONFERENTE, rotulo: 'Conferente' },
  { chave: Role.CONSULTOR_VENDAS, rotulo: 'Consultor de Vendas' },
  { chave: Role.OUTROS, rotulo: 'Outros' },
];

type CadastroNavProp = NativeStackNavigationProp<AuthStackParamList, 'Cadastro'>;

export function Cadastro() {
  const navigation = useNavigation<CadastroNavProp>();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [paisSelecionado, setPaisSelecionado] = useState<Pais>(PAISES[0]);

  const [cargoSelecionado, setCargoSelecionado] = useState<CargoItem>(CARGOS[1]);
  const [modalCargoVisivel, setModalCargoVisivel] = useState(false);
  const [outroCargo, setOutroCargo] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const aplicarMascaraTelefone = (valor: string) => {
    let apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length > 11) apenasNumeros = apenasNumeros.substring(0, 11);

    let formatado = apenasNumeros;
    if (apenasNumeros.length > 2) formatado = `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2)}`;
    if (apenasNumeros.length > 7) formatado = `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7, 11)}`;

    setTelefone(formatado);
  };

  const handleCadastro = async () => {
    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (!nome.trim() || !email.trim() || !senha.trim() || !telefoneLimpo) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (cargoSelecionado.chave === Role.OUTROS && !outroCargo.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, digite qual é o seu cargo.');
      return;
    }

    setIsLoading(true);

    const ddiLimpo = paisSelecionado.ddi.replace('+', '');
    const telefoneCompleto = `${ddiLimpo}${telefoneLimpo}`;

    try {
      await authService.register({
        name: nome.trim(),
        email: email.trim(),
        password: senha,
        phone: telefoneCompleto,
        role: cargoSelecionado.chave,
        customRole: cargoSelecionado.chave === Role.OUTROS ? outroCargo.trim() : null,
      });

      navigation.navigate('VerificacaoToken', { telefone: telefoneCompleto });
    } catch (error: any) {
      const mensagem = getApiErrorMessage(error, 'Não foi possível realizar o cadastro.');
      Alert.alert('Erro', mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Criar Conta</Text>

        <View style={styles.blocoCampo}>
          <Text style={styles.labelCampo}>Nome Completo</Text>
          <TextInput
            style={styles.inputLilas}
            placeholder="Digite seu nome completo"
            placeholderTextColor="#7E758C"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.blocoCampo}>
          <Text style={styles.labelCampo}>E-mail</Text>
          <TextInput
            style={styles.inputLilas}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#7E758C"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.blocoCampo}>
          <Text style={styles.labelCampo}>Senha</Text>
          <TextInput
            style={styles.inputLilas}
            placeholder="Digite sua senha"
            placeholderTextColor="#7E758C"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        <View style={styles.blocoCampo}>
          <Text style={styles.labelCampo}>Telefone</Text>
          <View style={styles.telefoneContainer}>
            <SeletorPais
              paisSelecionado={paisSelecionado}
              onSelecionarPais={setPaisSelecionado}
            />
            <TextInput
              style={styles.telefoneInput}
              placeholder="(  ) "
              placeholderTextColor="#7E758C"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={aplicarMascaraTelefone}
              maxLength={15}
            />
          </View>
        </View>

        <View style={styles.blocoCampo}>
          <Text style={styles.labelCampo}>Cargo</Text>
          <Pressable
            style={({ pressed }) => [styles.selectCargo, pressed && styles.selectCargoPressed]}
            onPress={() => setModalCargoVisivel(true)}
          >
            <Text style={styles.textoCargo}>{cargoSelecionado.rotulo}</Text>
            <Text style={styles.seta}>▼</Text>
          </Pressable>

          {cargoSelecionado.chave === Role.OUTROS && (
            <TextInput
              style={[styles.inputLilas, styles.inputOutroCargo]}
              placeholder="Digite o seu cargo"
              placeholderTextColor="#7E758C"
              value={outroCargo}
              onChangeText={setOutroCargo}
              autoFocus
            />
          )}
        </View>

        <PrimaryButton
          title="Cadastrar"
          onPress={handleCadastro}
          isLoading={isLoading}
        />

        <Modal
          visible={modalCargoVisivel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalCargoVisivel(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalCargoVisivel(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitulo}>Selecione o Cargo</Text>
              <FlatList
                data={CARGOS}
                keyExtractor={(item) => item.chave}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.itemOpcao,
                      item.chave === cargoSelecionado.chave && styles.itemOpcaoAtiva,
                      pressed && styles.itemOpcaoPressed,
                    ]}
                    onPress={() => {
                      setCargoSelecionado(item);
                      setModalCargoVisivel(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.textoOpcao,
                        item.chave === cargoSelecionado.chave && styles.textoOpcaoAtiva,
                      ]}
                    >
                      {item.rotulo}
                    </Text>
                  </Pressable>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}