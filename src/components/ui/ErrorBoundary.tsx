import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with a real error reporting service (e.g. Sentry) in production
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={64} color={Colors.error} />
          <Text style={styles.title}>Bir şeyler yanlış gitti</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'Beklenmedik bir hata oluştu.'}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={styles.btn}
            accessibilityRole="button"
            accessibilityLabel="Tekrar dene"
          >
            <Text style={styles.btnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.6,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.sm + 2,
    marginTop: Spacing.sm,
  },
  btnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
});
