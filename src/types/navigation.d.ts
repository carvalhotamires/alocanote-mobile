export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  VerificacaoToken: { telefone: string };
};

export type AppTabParamList = {
  Notebooks: undefined;
  MinhasReservas: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  NovaReserva: { notebookId?: number } | undefined;
  DetalhesReserva: { reservationId: number };
};

export type RootStackParamList = AuthStackParamList & AppStackParamList & {
  App: undefined;
  Auth: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}