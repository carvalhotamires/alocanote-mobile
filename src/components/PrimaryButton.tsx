import React from 'react';
import { StyleSheet, Text, Pressable, PressableProps, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface PrimaryButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger' | 'secondary' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PrimaryButton({
  title,
  isLoading = false,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  ...rest
}: PrimaryButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.baseButton,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isButtonDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isButtonDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4B0082' : '#FFFFFF'} />
      ) : (
        <Text style={[styles.baseText, styles[`${variant}Text`], textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  primary: {
    backgroundColor: '#4B0082',
  },
  primaryPressed: {
    backgroundColor: '#3A0066',
    opacity: 0.85,
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