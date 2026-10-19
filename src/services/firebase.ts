import { Platform } from 'react-native';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  Auth,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const googleOAuthConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
};

export interface FirebaseAuthResult {
  idToken: string;
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  emailVerified?: boolean;
  provider: 'GOOGLE' | 'FIREBASE_EMAIL';
}

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;

function getFirebaseAuth(): Auth | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.trim()) {
    return null;
  }

  if (!firebaseAppInstance) {
    firebaseAppInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }

  if (!firebaseAuthInstance) {
    firebaseAuthInstance = getAuth(firebaseAppInstance);
  }

  return firebaseAuthInstance;
}

export const firebaseAuthClient = {
  isConfigured(): boolean {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 0);
  },

  isGoogleConfigured(): boolean {
    return Boolean(
      (googleOAuthConfig.webClientId && googleOAuthConfig.webClientId.trim().length > 0) ||
      (googleOAuthConfig.androidClientId && googleOAuthConfig.androidClientId.trim().length > 0) ||
      (googleOAuthConfig.iosClientId && googleOAuthConfig.iosClientId.trim().length > 0) ||
      (Platform.OS === 'web' && this.isConfigured())
    );
  },

  async registerWithEmailAndPassword(
    email: string,
    password: string,
    displayName?: string
  ): Promise<FirebaseAuthResult | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      return null;
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    if (displayName && displayName.trim()) {
      try {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      } catch {
        // Ignora falha opcional ao definir displayName
      }
    }

    try {
      await sendEmailVerification(userCredential.user);
    } catch {
      // Ignora caso o envio de e-mail de verificação falhe
    }

    const idToken = await userCredential.user.getIdToken();

    return {
      idToken,
      uid: userCredential.user.uid,
      email: userCredential.user.email || email.trim().toLowerCase(),
      name: userCredential.user.displayName || displayName?.trim(),
      photoUrl: userCredential.user.photoURL || undefined,
      emailVerified: userCredential.user.emailVerified,
      provider: 'FIREBASE_EMAIL',
    };
  },

  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<FirebaseAuthResult | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      return null;
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    const idToken = await userCredential.user.getIdToken();

    return {
      idToken,
      uid: userCredential.user.uid,
      email: userCredential.user.email || email.trim().toLowerCase(),
      name: userCredential.user.displayName || undefined,
      photoUrl: userCredential.user.photoURL || undefined,
      emailVerified: userCredential.user.emailVerified,
      provider: 'FIREBASE_EMAIL',
    };
  },

  async signInWithGoogleWebPopup(): Promise<FirebaseAuthResult> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error(
        'Configure EXPO_PUBLIC_FIREBASE_API_KEY e EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN no arquivo .env.'
      );
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();

    return {
      idToken,
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      name: userCredential.user.displayName || undefined,
      photoUrl: userCredential.user.photoURL || undefined,
      emailVerified: userCredential.user.emailVerified,
      provider: 'GOOGLE',
    };
  },

  async signInWithGoogleCredential(
    googleIdToken?: string | null,
    googleAccessToken?: string | null
  ): Promise<FirebaseAuthResult> {
    if (!googleIdToken && !googleAccessToken) {
      throw new Error('Token de autenticação do Google não retornado pelo provedor.');
    }

    const auth = getFirebaseAuth();
    if (auth) {
      const credential = GoogleAuthProvider.credential(
        googleIdToken || null,
        googleAccessToken || undefined
      );
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseIdToken = await userCredential.user.getIdToken();

      return {
        idToken: firebaseIdToken,
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || undefined,
        photoUrl: userCredential.user.photoURL || undefined,
        emailVerified: userCredential.user.emailVerified,
        provider: 'GOOGLE',
      };
    }

    if (googleIdToken) {
      return {
        idToken: googleIdToken,
        uid: '',
        email: '',
        emailVerified: true,
        provider: 'GOOGLE',
      };
    }

    throw new Error(
      'Configure EXPO_PUBLIC_FIREBASE_API_KEY no arquivo .env para finalizar a autenticação com o Firebase.'
    );
  },
};
