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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reservationService } from '../services/reservationService';
import { getApiErrorMessage } from '../services/api';
import { ReservationResponseDTO, ReservationStatus } from '../types';

export function MinhasReservas() {
  const [reservas, setReservas] = useState<ReservationResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const carregarReservas = useCallback(async () => {
    try {
      const dados = await reservationService.listMyReservations();
      setReservas(dados);
    } catch (error) {
      const mensagem = getApiErrorMessage(error, 'Erro ao buscar suas reservas.');
      Alert.alert('Erro', mensagem);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarReservas();
  }, [carregarReservas]);

  const onRefresh = () => {
    setIsRefreshing(true);
    carregarReservas();
  };

  const handleCheckIn = async (reservaId: number) => {
    Alert.alert(
      'Confirmar Retirada',
      'Confirma o check-in e a retirada deste notebook agora?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, fazer check-in',
          onPress: async () => {
            setLoadingActionId(reservaId);
            try {
              await reservationService.checkInReservation(reservaId);
              Alert.alert('Sucesso', 'Check-in realizado com sucesso! Bom trabalho.');
              await carregarReservas();
            } catch (error) {
              const mensagem = getApiErrorMessage(error, 'Não foi possível realizar o check-in.');
              Alert.alert('Falha', mensagem);
            } finally {
              setLoadingActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleFinalizar = async (reservaId: number) => {
    Alert.alert(
      'Confirmar Devolução',
      'Confirma a entrega do equipamento e finalização da reserva?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, devolver',
          onPress: async () => {
            setLoadingActionId(reservaId);
            try {
              await reservationService.finishReservation(reservaId);
              Alert.alert('Sucesso', 'Reserva finalizada e notebook devolvido com sucesso!');
              await carregarReservas();
            } catch (error) {
              const mensagem = getApiErrorMessage(error, 'Não foi possível finalizar a reserva.');
              Alert.alert('Falha', mensagem);
            } finally {
              setLoadingActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancelar = async (reservaId: number) => {
    Alert.alert(
      'Cancelar Reserva',
      'Tem certeza de que deseja cancelar esta reserva?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setLoadingActionId(reservaId);
            try {
              await reservationService.cancelReservation(reservaId);
              Alert.alert('Sucesso', 'Reserva cancelada.');
              await carregarReservas();
            } catch (error) {
              const mensagem = getApiErrorMessage(error, 'Não foi possível cancelar a reserva.');
              Alert.alert('Falha', mensagem);
            } finally {
              setLoadingActionId(null);
            }
          },
        },
      ]
    );
  };

  const formatarData = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const data = new Date(isoDate);
      if (isNaN(data.getTime())) return isoDate;
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    } catch {
      return isoDate;
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.AGENDADO:
        return '#2563EB'; // azul
      case ReservationStatus.CHECKED_IN:
        return '#059669'; // verde esmeralda
      case ReservationStatus.FINALIZADO:
        return '#4B5563'; // cinza neutro
      case ReservationStatus.CANCELADO:
        return '#DC2626'; // vermelho
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.AGENDADO:
        return 'Agendado';
      case ReservationStatus.CHECKED_IN:
        return 'Em Andamento (Check-in)';
      case ReservationStatus.FINALIZADO:
        return 'Finalizado';
      case ReservationStatus.CANCELADO:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: ReservationResponseDTO }) => {
    const isActionLoading = loadingActionId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.notebookName}>{item.notebookName}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.modelDescription}>{item.notebookModel}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Início:</Text>
          <Text style={styles.infoValue}>{formatarData(item.startTime)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Término:</Text>
          <Text style={styles.infoValue}>{formatarData(item.endTime)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Local:</Text>
          <Text style={styles.infoValue}>{item.locationName}</Text>
        </View>

        {item.purpose ? (
          <View style={styles.purposeBox}>
            <Text style={styles.purposeLabel}>Motivo:</Text>
            <Text style={styles.purposeText}>{item.purpose}</Text>
          </View>
        ) : null}

        {/* Botões contextuais pelo ciclo de vida */}
        {item.status === ReservationStatus.AGENDADO && (
          <View style={styles.actionsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.checkInButton,
                pressed && styles.checkInButtonPressed,
                isActionLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleCheckIn(item.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Fazer Check-in</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
                isActionLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleCancelar(item.id)}
              disabled={isActionLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        )}

        {item.status === ReservationStatus.CHECKED_IN && (
          <View style={styles.actionsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.finishButton,
                pressed && styles.finishButtonPressed,
                isActionLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleFinalizar(item.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Devolver / Finalizar</Text>
              )}
            </Pressable>
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
          <Text style={styles.headerTitle}>Minhas Reservas</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.headerSubtitle}>Acompanhamento, check-in e devoluções</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E22CE" />
          <Text style={styles.loadingText}>Carregando reservas...</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 85 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#7E22CE']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma reserva encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Vá até a aba "Notebooks" e selecione um equipamento para agendar.
              </Text>
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
  headerSubtitle: {
    color: '#E9D5FF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
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
    marginBottom: 6,
  },
  notebookName: {
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
  modelDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 68,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
  purposeBox: {
    marginTop: 8,
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: 8,
  },
  purposeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B21A8',
    marginBottom: 2,
  },
  purposeText: {
    fontSize: 13,
    color: '#374151',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#059669',
  },
  checkInButtonPressed: {
    backgroundColor: '#047857',
  },
  finishButton: {
    backgroundColor: '#4B0082',
  },
  finishButtonPressed: {
    backgroundColor: '#3A0066',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  cancelButtonPressed: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
