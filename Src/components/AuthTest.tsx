import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth, AuthState } from '../providers/AuthProvider';
import colors from '../Theme/Colors';

/**
 * Simple Authentication Test Component
 * Use this to test the new auth system
 */
export const AuthTest: React.FC = () => {
  const {
    authState,
    isAuthenticated,
    isLoading,
    session,
    login,
    logout,
    error,
    clearError,
    userDetails,
  } = useAuth();

  const [email, setEmail] = useState('test@example.com');

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      console.log('🚀 Starting login test...');
      await login({ email: email.trim() });
      Alert.alert('Success', 'Login successful!');
    } catch (err: any) {
      console.error('❌ Login test failed:', err);
      Alert.alert('Login Failed', err.message || 'An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout test...');
      await logout();
      Alert.alert('Success', 'Logout successful!');
    } catch (err: any) {
      console.error('❌ Logout test failed:', err);
      Alert.alert('Logout Failed', err.message || 'An error occurred');
    }
  };

  const getStatusColor = () => {
    switch (authState) {
      case AuthState.AUTHENTICATED: return '#4CAF50';
      case AuthState.UNAUTHENTICATED: return '#FF9800';
      case AuthState.LOADING: return '#2196F3';
      case AuthState.ERROR: return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Auth System Test</Text>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>
          {authState.toUpperCase().replace('_', ' ')}
        </Text>
      </View>

      {/* Debug Info */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>• Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.debugText}>• Loading: {isLoading ? '⏳ Yes' : '🔄 No'}</Text>
        <Text style={styles.debugText}>• Email: {session?.userEmail || 'None'}</Text>
        <Text style={styles.debugText}>• Address: {session?.publicAddress || 'None'}</Text>
        <Text style={styles.debugText}>• User Details: {userDetails?.emailAddress || 'None'}</Text>
        {error && (
          <Text style={[styles.debugText, styles.errorDebugText]}>
            • Error: {error.message}
          </Text>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error.message}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
            <Text style={styles.clearErrorText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isAuthenticated ? (
        // Login Form
        <View style={styles.loginSection}>
          <Text style={styles.sectionTitle}>Login Test</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '⏳ Logging in...' : '🔐 Login'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Logout Section
        <View style={styles.logoutSection}>
          <Text style={styles.sectionTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Logged in as: {session?.userEmail}
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton, isLoading && styles.disabledButton]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '⏳ Logging out...' : '🚪 Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          📱 This is a test component for the new authentication system.
        </Text>
        <Text style={styles.infoText}>
          ✨ It uses AsyncStorage instead of Keychain for testing.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  debugSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'monospace',
  },
  errorDebugText: {
    color: colors.error,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
    fontSize: 14,
  },
  clearErrorButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearErrorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default AuthTest;
