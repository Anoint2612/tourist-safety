import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Keyboard
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  useTheme, 
  HelperText, 
  Checkbox, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  Portal,
  Modal,
  Surface
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, registerUser } from '../../store/actions/authActions';
import { authAPI } from '../../services/api';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Ionicons } from '@react-native-vector-icons/ionicons';

// Selectors
const selectAuthError = (state) => state.auth.error;
const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
const selectAuthLoading = (state) => state.auth.loading;

// Validation Schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  aadhaarNumber: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhaar number must be 12 digits')
    .required('Aadhaar number is required'),
  role: Yup.string()
    .oneOf(['tourist', 'guide'], 'Please select a role')
    .required('Role is required'),
});

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // State and selectors
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [selectedRole, setSelectedRole] = useState('tourist');

  // Formik ref
  const formikRef = useRef();

  // Role selection handler
  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    // Update form value when role is selected
    if (formikRef.current) {
      formikRef.current.setFieldValue('role', role);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [isAuthenticated, navigation]);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Log any auth errors
  useEffect(() => {
    if (authError) {
      console.error('Auth error:', authError);
    }
  }, [authError]);

  const handleSubmitForm = async (values, { setSubmitting, setFieldError }) => {
    console.log('Form submission started with values:', values);
    try {
      setSubmitting(true);
      
      // Prepare user data for submission
      const userData = {
        ...values,
        emergencyContacts: emergencyContacts
      };
      
      console.log('Prepared user data for submission:', userData);

      // Validate at least one emergency contact is added
      if (emergencyContacts.length === 0) {
        setFieldError('form', 'Please add at least one emergency contact');
        setSubmitting(false);
        return;
      }

      console.log('User data:', userData);
      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        const { token, user } = result.payload;
        
        // Store token and user data
        await AsyncStorage.multiSet([
          ['userToken', token],
          ['userData', JSON.stringify(user)]
        ]);
        
        // Navigate to main app after successful registration
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (registerUser.rejected.match(result)) {
        setFieldError('form', result.payload || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setFieldError('form', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const addEmergencyContactLocal = () => {
    if (newContact.name && newContact.phone && newContact.relation) {
      setEmergencyContacts([...emergencyContacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '', relation: '' });
      setShowEmergencyForm(false);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  // Remove emergency contact field
  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length > 1) {
      const updatedContacts = [...emergencyContacts];
      updatedContacts.splice(index, 1);
      setEmergencyContacts(updatedContacts);
    }
  };

  // Update emergency contact
  const updateEmergencyContact = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setEmergencyContacts(updatedContacts);
  };

  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'tourist',
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => Keyboard.dismiss()}
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
            {t('register')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}> 
            {t('fill_details_to_get_started') || 'Fill in your details to get started'}
          </Text>
        </View>

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmitForm}
          validateOnMount={false}
          validateOnBlur={true}
          validateOnChange={true}
          enableReinitialize={true}
          validateOnSubmit={true}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
            <View style={styles.formContainer}>
              {/* Role Selection */}
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}> 
                    {t('role')}
                  </Title>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.roleOption, 
                        { 
                          borderColor: selectedRole === 'tourist' ? theme.colors.primary : theme.colors.border,
                          backgroundColor: selectedRole === 'tourist' ? theme.colors.primaryContainer : 'transparent'
                        }
                      ]}
                      onPress={() => handleRoleSelect('tourist')}
                    >
                      <Ionicons 
                        name="person-outline" 
                        size={24} 
                        color={selectedRole === 'tourist' ? theme.colors.primary : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.roleText, 
                        { color: selectedRole === 'tourist' ? theme.colors.primary : theme.colors.text }
                      ]}>
                        {t('tourist')}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.roleOption, 
                        { 
                          borderColor: selectedRole === 'guide' ? theme.colors.primary : theme.colors.border,
                          backgroundColor: selectedRole === 'guide' ? theme.colors.primaryContainer : 'transparent'
                        }
                      ]}
                      onPress={() => handleRoleSelect('guide')}
                    >
                      <Ionicons 
                        name="compass-outline" 
                        size={24} 
                        color={selectedRole === 'guide' ? theme.colors.primary : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.roleText, 
                        { color: selectedRole === 'guide' ? theme.colors.primary : theme.colors.text }
                      ]}>
                        {t('guide')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>

              {/* Personal Information */}
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}> 
                    {t('user_info')}
                  </Title>
                  
                  {/* Name Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('name')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialDesignIcons name="account-outline" size={size} color={color} />
                      )} />}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={() => handleBlur('name')}
                      autoCapitalize="words"
                      error={touched.name && errors.name ? true : false}
                    />
                    <HelperText type="error" visible={touched.name && errors.name ? true : false}>
                      {errors.name}
                    </HelperText>
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('email')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialDesignIcons name="email-outline" size={size} color={color} />
                      )} />}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={() => handleBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={touched.email && errors.email ? true : false}
                    />
                    <HelperText type="error" visible={touched.email && errors.email ? true : false}>
                      {errors.email}
                    </HelperText>
                  </View>

                  {/* Phone Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('phone')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialDesignIcons name="phone-outline" size={size} color={color} />
                      )} />}
                      value={values.phone}
                      onChangeText={handleChange('phone')}
                      onBlur={() => handleBlur('phone')}
                      keyboardType="phone-pad"
                      error={touched.phone && errors.phone ? true : false}
                      maxLength={10}
                    />
                    <HelperText type="error" visible={touched.phone && errors.phone ? true : false}>
                      {errors.phone}
                    </HelperText>
                  </View>
                </Card.Content>
              </Card>

              {/* KYC Information */}
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}> 
                    {t('kvc_verify')}
                  </Title>
                  <Paragraph style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}> 
                    {t('kyc_info') || 'We need to verify your identity for your safety and security'}
                  </Paragraph>
                  
                  {/* Aadhaar Number Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('aadhaar_number')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialDesignIcons name="card-account-details-outline" size={size} color={color} />
                      )} />}
                      value={values.aadhaarNumber}r
                      onChangeText={handleChange('aadhaarNumber')}
                      onBlur={() => handleBlur('aadhaarNumber')}
                      keyboardType="numeric"
                      maxLength={12}
                      error={touched.aadhaarNumber && errors.aadhaarNumber ? true : false}
                    />
                    <HelperText type="error" visible={touched.aadhaarNumber && errors.aadhaarNumber ? true : false}>
                      {errors.aadhaarNumber}
                    </HelperText>
                    <HelperText type="info" visible={true}>
                      {t('aadhaar_info') || 'Your Aadhaar number will be securely hashed and stored'}
                    </HelperText>
                  </View>
                </Card.Content>
              </Card>

              {/* Emergency Contacts */}
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.emergencyHeader}>
                    <View>
                      <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}> 
                        {t('emergency_contacts')}
                      </Title>
                      <Paragraph style={{ color: theme.colors.textSecondary, marginTop: -5 }}>
                        {t('add_contact')}
                      </Paragraph>
                    </View>
                    {!showEmergencyForm && (
                      <Button 
                        mode="outlined" 
                        onPress={() => setShowEmergencyForm(true)}
                        style={styles.addButton}
                        icon="plus"
                      >
                        {t('add_contact')}
                      </Button>
                    )}
                  </View>
                  
                  {emergencyContacts.map((contact, index) => (
                    <View key={index} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: theme.colors.text }]}>
                          {contact.name}
                        </Text>
                        <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
                          {contact.phone} • {contact.relation}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeEmergencyContact(index)}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {showEmergencyForm && (
                    <View style={styles.emergencyForm}>
                      <TextInput
                        label="Contact Name"
                        mode="outlined"
                        value={newContact.name}
                        onChangeText={(text) => setNewContact({...newContact, name: text})}
                        style={styles.formInput}
                      />
                      <TextInput
                        label="Phone Number"
                        mode="outlined"
                        value={newContact.phone}
                        onChangeText={(text) => setNewContact({...newContact, phone: text})}
                        keyboardType="phone-pad"
                        style={styles.formInput}
                      />
                      <TextInput
                        label="Relation"
                        mode="outlined"
                        value={newContact.relation}
                        onChangeText={(text) => setNewContact({...newContact, relation: text})}
                        style={styles.formInput}
                      />
                      <View style={styles.formButtons}>
                        <Button mode="outlined" onPress={() => setShowEmergencyForm(false)}>
                          {t('cancel')}
                        </Button>
                        <Button mode="contained" onPress={() => {
                          setEmergencyContacts([...emergencyContacts, newContact]);
                          setShowEmergencyForm(false);
                          setNewContact({ name: '', phone: '', relation: '' });
                        }}>
                          {t('add_contact')}
                        </Button>
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>

              {/* Security Information */}
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}> 
                    {t('security')}
                  </Title>
                  
                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('password')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialIcons name="lock-outline" size={size} color={color} />
                      )} />}
                      right={
                        <TextInput.Icon 
                          icon={({ color, size }) => (
                            <MaterialDesignIcons 
                              name={showPassword ? 'eye' : 'eye-off'} 
                              size={size} 
                              color={color} 
                            />
                          )} 
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={() => handleBlur('password')}
                      secureTextEntry={!showPassword}
                      error={touched.password && errors.password ? true : false}
                    />
                    <HelperText type="error" visible={touched.password && errors.password ? true : false}>
                      {errors.password}
                    </HelperText>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t('confirm_password')}
                      mode="outlined"
                      left={<TextInput.Icon icon={({ color, size }) => (
                        <MaterialDesignIcons name="lock-check-outline" size={size} color={color} />
                      )} />}
                      right={
                        <TextInput.Icon 
                          icon={({ color, size }) => (
                            <MaterialDesignIcons 
                              name={showConfirmPassword ? 'eye' : 'eye-off'} 
                              size={size} 
                              color={color} 
                            />
                          )} 
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      secureTextEntry={!showConfirmPassword}
                      error={touched.confirmPassword && errors.confirmPassword ? true : false}
                    />
                    <HelperText type="error" visible={touched.confirmPassword && errors.confirmPassword ? true : false}>
                      {errors.confirmPassword}
                    </HelperText>
                  </View>
                </Card.Content>
              </Card>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Checkbox.Android
                  status={acceptedTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  color={theme.colors.primary}
                />
                <Text style={styles.termsText}>
                  {t('agree_terms') || 'I agree to the'}{' '}
                  <Text 
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => setShowTermsModal(true)}
                  >
                    {t('terms_and_conditions') || 'Terms & Conditions'}
                  </Text>
                  {' '}and{' '}
                  <Text 
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => setShowTermsModal(true)}
                  >
                    {t('privacy_policy') || 'Privacy Policy'}
                  </Text>
                </Text>
              </View>

              {/* Error Message */}
              {authError && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{authError}</Text>
                </View>
              )}

              {/* Create Account Button */}
              <Button 
                mode="contained" 
                onPress={() => {
                  console.log('Submit button pressed');
                  
                  // Check terms acceptance first
                  if (!acceptedTerms) {
                    Alert.alert(t('terms_required') || 'Terms Required', t('accept_terms') || 'Please accept the terms and conditions');
                    return;
                  }
                  
                  // Check role selection
                  if (!selectedRole) {
                    Alert.alert(t('role_required') || 'Role Required', t('select_role') || 'Please select your role (Tourist or Guide)');
                    return;
                  }
                  
                  // Update the role in form values and trigger form submission
                  setFieldValue('role', selectedRole, false).then(() => {
                    console.log('Form values before submission:', { ...values, role: selectedRole });
                    handleSubmit();
                  });
                }}
                style={[styles.button, { marginTop: 20 }]}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('creating_account') || 'Creating Account...' : t('register')}
              </Button>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {t('already_have_account') || 'Already have an account?'}{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {t('login')}
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
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    marginVertical: 5,
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
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  roleOption: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  emergencyForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  formInput: {
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  termsText: {
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default RegisterScreen;