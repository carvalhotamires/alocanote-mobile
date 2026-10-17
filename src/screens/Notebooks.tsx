import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { notebookService } from '../services/notebookService';
import { getApiErrorMessage } from '../services/api';
import { NotebookResponseDTO, NotebookStatus } from '../types';
import { AppStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type NotebooksNavProp = NativeStackNavigationProp<AppStackParamList>;

export function Notebooks() {
  const [notebooks, setNotebooks] = useState<NotebookResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation<NotebooksNavProp>();
  const { user, signOut } = useAuth();

  const carregarNotebooks = useCallback(async () => {
    try {
      const dados = await notebookService.listNotebooks();
      setNotebooks(dados);
    } catch (error) {
      const mensagem = getApiErrorMessage(error, 'Erro ao carregar notebooks.');
      Alert.alert('Erro', mensagem);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarNotebooks();
  }, [carregarNotebooks]);

  const onRefresh = () => {
    setIsRefreshing(true);
    carregarNotebooks();
  };

  const getStatusColor = (status: NotebookStatus) => {
    switch (status) {
      case NotebookStatus.DISPONIVEL:
        return '#15803D'; // verde
      case NotebookStatus.EM_USO:
        return '#D97706'; // laranja
      case NotebookStatus.MANUTENCAO:
        return '#DC2626'; // vermelho
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: NotebookStatus) => {
    switch (status) {
      case NotebookStatus.DISPONIVEL:
        return 'Disponível';
      case NotebookStatus.EM_USO:
        return 'Em Uso';
      case NotebookStatus.MANUTENCAO:
        return 'Em Manutenção';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: NotebookResponseDTO }) => {
    const isDisponivel = item.status === NotebookStatus.DISPONIVEL;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>{item.modelDescription}</Text>

        {isDisponivel ? (
          <Pressable
            style={({ pressed }) => [styles.reserveButton, pressed && styles.reserveButtonPressed]}
            onPress={() => navigation.navigate('NovaReserva', { notebookId: item.id })}
          >
            <Text style={styles.reserveButtonText}>Reservar Equipamento</Text>
          </Pressable>
        ) : (
          <View style={styles.indisponivelContainer}>
            <Text style={styles.indisponivelText}>
              {item.status === NotebookStatus.MANUTENCAO
                ? 'Equipamento em reparo técnico'
                : 'Atualmente alocado por outro colaborador'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {user?.name || 'Colaborador'}</Text>
          <Text style={styles.subtitleText}>Notebooks para Reservas</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={signOut}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B0082" />
          <Text style={styles.loadingText}>Carregando equipamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={notebooks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4B0082']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum equipamento cadastrado no momento.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4B0082',
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '500',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  reserveButton: {
    backgroundColor: '#4B0082',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reserveButtonPressed: {
    backgroundColor: '#3A0066',
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  indisponivelContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  indisponivelText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
  },
});
