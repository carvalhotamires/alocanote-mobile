import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from './Perfil.styles';

export function Perfil() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Tem certeza de que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.profileHeaderContent}>
          <View style={styles.avatarBorder}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
              }}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'Colaborador'}</Text>
          <View style={styles.userRoleBadge}>
            <Text style={styles.userRoleText}>{user?.role || 'Colaborador'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informações da Conta</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome Completo</Text>
            <Text style={styles.infoValue}>{user?.name || '-'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail Corporativo</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cargo / Função</Text>
            <Text style={styles.infoValue}>{user?.role || '-'}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
