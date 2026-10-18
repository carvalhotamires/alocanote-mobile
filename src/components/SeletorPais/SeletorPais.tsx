import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { PAISES, Pais } from '../../constants/paises';
import { styles } from './SeletorPais.styles';

interface SeletorPaisProps {
  paisSelecionado: Pais;
  onSelecionarPais: (pais: Pais) => void;
}

export function SeletorPais({ paisSelecionado, onSelecionarPais }: SeletorPaisProps) {
  const [modalVisivel, setModalVisivel] = useState(false);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.ddiContainer, pressed && styles.ddiPressed]}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={styles.bandeira}>{paisSelecionado.bandeira}</Text>
        <Text style={styles.seta}>▼</Text>
        <View style={styles.divisor} />
        <Text style={styles.prefixo}>{paisSelecionado.ddi}</Text>
      </Pressable>

      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisivel(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitulo}>Selecione o País</Text>
            <FlatList
              data={PAISES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.itemOpcao,
                    item.id === paisSelecionado.id && styles.itemOpcaoAtiva,
                    pressed && styles.itemOpcaoPressed,
                  ]}
                  onPress={() => {
                    onSelecionarPais(item);
                    setModalVisivel(false);
                  }}
                >
                  <Text style={styles.bandeiraItem}>{item.bandeira}</Text>
                  <Text style={styles.nomeItem}>{item.nome}</Text>
                  <Text style={styles.ddiItem}>{item.ddi}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
