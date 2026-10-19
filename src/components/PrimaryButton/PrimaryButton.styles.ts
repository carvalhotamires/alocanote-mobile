import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  baseButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#4B0082',
  },
  primary: {
    backgroundColor: '#4B0082',
  },
  primaryPressed: {
    backgroundColor: '#3A0066',
    opacity: 0.85,
  },
  buttonPressed: {
    backgroundColor: '#3A0066',
  },
  secondary: {
    backgroundColor: '#7E22CE',
  },
  secondaryPressed: {
    backgroundColor: '#6B21A8',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  dangerPressed: {
    backgroundColor: '#B91C1C',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4B0082',
  },
  outlinePressed: {
    backgroundColor: '#FAF5FF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  baseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#4B0082',
  },
});