import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (values) => {
    try {
      setIsLoading(true);
      // TODO: Implement forgot password logic
      console.log('Reset password request for:', values.email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open-outline" size={80} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Check Your Email
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.buttonLabel}
          >
            Back to Login
          </Button>
          <TouchableOpacity 
            style={styles.resendLink}
            onPress={() => setEmailSent(false)}
          >
            <Text style={{ color: theme.colors.primary }}>Resend email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            Forgot Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email to receive a password reset link
          </Text>
        </View>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  left={<TextInput.Icon icon={({ color, size }) => (
                    <MaterialCommunityIcons name="email-outline" size={size} color={color} />
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

              {/* Reset Password Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.buttonLabel}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {/* Back to Login Link */}
              <View style={styles.loginContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={{ color: theme.colors.primary }}>
                    <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />{' '}
                    Back to Login
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
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
  loginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendLink: {
    marginTop: 20,
    padding: 10,
  },
});

export default ForgotPasswordScreen;
