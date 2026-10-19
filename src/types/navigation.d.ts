export type AuthStackParamList = {
  Login: { email?: string } | undefined;
  Cadastro: undefined;
  VerificacaoToken: { telefone?: string; email?: string } | undefined;
};

export type AppTabParamList = {
  Notebooks: undefined;
  MinhasReservas: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  MainTabs: { screen?: keyof AppTabParamList } | undefined;
  Notebooks: undefined;
  MinhasReservas: undefined;
  NovaReserva: { notebookId?: number } | undefined;
  Calendario: undefined;
  Perfil: undefined;
  DetalhesReserva?: { reservationId: number };
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