import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser } from '../../store/actions/authActions';
import { authAPI } from '../../services/api';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, ActivityIndicator } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage';
// Selectors
const selectAuthError = (state) => state.auth.error;
const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
const selectAuthLoading = (state) => state.auth.loading;

// Validation Schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token && !isAuthenticated) {
          // Optional: Validate token with server
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };

    checkAuth();
  }, [isAuthenticated, navigation]);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await dispatch(loginUser(values));
      
      if (loginUser.fulfilled.match(result)) {
        const { token, user } = result.payload;
                
        // Store token and user data
        await AsyncStorage.multiSet([
          ['userToken', token],
          ['userData', JSON.stringify(user)]
        ]);
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (loginUser.rejected.match(result)) {
        setFieldError('form', result.payload || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setFieldError('form', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign in to continue
          </Text>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  left={<TextInput.Icon icon={({ color, size }) => (
                    <MaterialDesignIcons name="email-outline" size={size} color={color} />
                  )} />}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched.email && errors.email ? true : false}
                />
                <HelperText type="error" visible={touched.email && errors.email ? true : false}>
                  {errors.email}
                </HelperText>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Password"
                  mode="outlined"
                  left={<TextInput.Icon icon={({ color, size }) => (
                    <MaterialDesignIcons name="lock-outline" size={size} color={color} />
                  )} />}
                  right={
                    <TextInput.Icon 
                      icon={({ color, size }) => (
                        <MaterialDesignIcons 
                          name={secureTextEntry ? 'eye-off' : 'eye'} 
                          size={size} 
                          color={color} 
                        />
                      )} 
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                    />
                  }
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureTextEntry}
                  error={touched.password && errors.password ? true : false}
                />
                <HelperText type="error" visible={touched.password && errors.password ? true : false}>
                  {errors.password}
                </HelperText>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={{ color: theme.colors.primary }}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Error Message */}
              {errors.form && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.form}</Text>
                </View>
              )}

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={isSubmitting}
                disabled={isSubmitting}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Social Login Options */}
              <View style={styles.socialLoginContainer}>
                <View style={styles.dividerContainer}>
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                    OR CONTINUE WITH
                  </Text>
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                </View>

                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={[styles.socialButton, { borderColor: theme.colors.border }]}
                    onPress={() => console.log('Google login')}
                  >
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.socialButton, { borderColor: theme.colors.border }]}
                    onPress={() => console.log('Facebook login')}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => {
                  console.log('Navigating to Register screen');
                  navigation.navigate('Register');
                }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  buttonContent: {
    height: 50,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  socialLoginContainer: {
    marginTop: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
