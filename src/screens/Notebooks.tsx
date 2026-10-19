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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

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
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>← Início</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Notebooks</Text>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={signOut}
          >
            <Text style={styles.logoutButtonText}>Sair</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitleText}>Equipamentos disponíveis para alocação</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E22CE" />
          <Text style={styles.loadingText}>Carregando equipamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={notebooks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 85 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#7E22CE']} />
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
    backgroundColor: '#F8F6FD',
  },
  header: {
    backgroundColor: '#5B1B8E',
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitleText: {
    color: '#E9D5FF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    elevation: 2,
    shadowColor: '#7E22CE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  reserveButton: {
    backgroundColor: '#7E22CE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  reserveButtonPressed: {
    backgroundColor: '#6B21A8',
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  indisponivelContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
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
