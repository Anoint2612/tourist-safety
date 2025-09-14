import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  useTheme, 
  Card, 
  Title, 
  Paragraph,
  Chip,
  IconButton
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useDispatch } from 'react-redux';
import { addTrip, setActiveTrip } from '../../store/reducers/tripReducer';
import DateTimePicker from '@react-native-community/datetimepicker';

// Validation Schema
const TripSetupSchema = Yup.object().shape({
  startPoint: Yup.string()
    .min(2, 'Start point must be at least 2 characters')
    .required('Start point is required'),
  destination: Yup.string()
    .min(2, 'Destination must be at least 2 characters')
    .required('Destination is required'),
  startDate: Yup.date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  modeOfTravel: Yup.string()
    .oneOf(['car', 'bus', 'train', 'flight', 'trekking', 'other'], 'Please select a mode of travel')
    .required('Mode of travel is required'),
});

const TripSetupScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const [additionalDestinations, setAdditionalDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState('');

  const travelModes = [
    { key: 'car', label: 'Car', icon: 'car-outline' },
    { key: 'bus', label: 'Bus', icon: 'bus-outline' },
    { key: 'train', label: 'Train', icon: 'train-outline' },
    { key: 'flight', label: 'Flight', icon: 'airplane-outline' },
    { key: 'trekking', label: 'Trekking', icon: 'walk-outline' },
    { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleTripSetup = async (values) => {
    try {
      setIsLoading(true);
      
      const tripData = {
        ...values,
        additionalDestinations,
        status: 'planned',
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      };
      
      // Add trip to store
      dispatch(addTrip(tripData));
      dispatch(setActiveTrip(tripData));
      
      Alert.alert(
        'Trip Created Successfully',
        'Your trip has been set up. You can now start tracking your journey.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs')
          }
        ]
      );
      
    } catch (error) {
      console.error('Trip setup error:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDestination = () => {
    if (newDestination.trim()) {
      setAdditionalDestinations([...additionalDestinations, newDestination.trim()]);
      setNewDestination('');
    }
  };

  const removeDestination = (index) => {
    setAdditionalDestinations(additionalDestinations.filter((_, i) => i !== index));
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>
          Plan Your Trip
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Tell us about your travel plans so we can keep you safe
        </Paragraph>
      </View>

      <Formik
        initialValues={{
          startPoint: '',
          destination: '',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          modeOfTravel: '',
          description: '',
        }}
        validationSchema={TripSetupSchema}
        onSubmit={handleTripSetup}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.formContainer}>
            {/* Start Point */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Where are you starting from?
                </Title>
                <TextInput
                  label="Start Point"
                  mode="outlined"
                  left={<TextInput.Icon icon="map-marker-outline" />}
                  value={values.startPoint}
                  onChangeText={handleChange('startPoint')}
                  onBlur={handleBlur('startPoint')}
                  placeholder="e.g., Airport, Hotel, Home"
                  error={touched.startPoint && errors.startPoint ? true : false}
                />
                {touched.startPoint && errors.startPoint && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.startPoint}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Destination */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Main Destination
                </Title>
                <TextInput
                  label="Destination"
                  mode="outlined"
                  left={<TextInput.Icon icon="flag-outline" />}
                  value={values.destination}
                  onChangeText={handleChange('destination')}
                  onBlur={handleBlur('destination')}
                  placeholder="e.g., Paris, France"
                  error={touched.destination && errors.destination ? true : false}
                />
                {touched.destination && errors.destination && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.destination}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Additional Destinations */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Additional Destinations (Optional)
                </Title>
                <Paragraph style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                  Add other places you plan to visit
                </Paragraph>
                
                {additionalDestinations.map((dest, index) => (
                  <View key={index} style={styles.destinationItem}>
                    <Chip 
                      mode="outlined" 
                      onClose={() => removeDestination(index)}
                      style={styles.destinationChip}
                    >
                      {dest}
                    </Chip>
                  </View>
                ))}
                
                <View style={styles.addDestinationContainer}>
                  <TextInput
                    label="Add destination"
                    mode="outlined"
                    value={newDestination}
                    onChangeText={setNewDestination}
                    style={styles.addDestinationInput}
                    onSubmitEditing={addDestination}
                  />
                  <Button 
                    mode="outlined" 
                    onPress={addDestination}
                    disabled={!newDestination.trim()}
                    style={styles.addButton}
                  >
                    Add
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* Travel Dates */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Travel Dates
                </Title>
                
                <View style={styles.dateContainer}>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      label="Start Date"
                      mode="outlined"
                      value={values.startDate.toLocaleDateString()}
                      editable={false}
                      right={
                        <TextInput.Icon 
                          icon="calendar-outline" 
                          onPress={() => setShowStartDatePicker(true)}
                        />
                      }
                    />
                    {touched.startDate && errors.startDate && (
                      <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {errors.startDate}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      label="End Date"
                      mode="outlined"
                      value={values.endDate.toLocaleDateString()}
                      editable={false}
                      right={
                        <TextInput.Icon 
                          icon="calendar-outline" 
                          onPress={() => setShowEndDatePicker(true)}
                        />
                      }
                    />
                    {touched.endDate && errors.endDate && (
                      <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {errors.endDate}
                      </Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Mode of Travel */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Mode of Travel
                </Title>
                <Paragraph style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                  How will you be traveling?
                </Paragraph>
                
                <View style={styles.travelModesContainer}>
                  {travelModes.map((mode) => (
                    <TouchableOpacity
                      key={mode.key}
                      style={[
                        styles.travelModeOption,
                        {
                          borderColor: selectedMode === mode.key ? theme.colors.primary : theme.colors.border,
                          backgroundColor: selectedMode === mode.key ? theme.colors.primaryContainer : 'transparent'
                        }
                      ]}
                      onPress={() => {
                        setSelectedMode(mode.key);
                        setFieldValue('modeOfTravel', mode.key);
                      }}
                    >
                      <Ionicons 
                        name={mode.icon} 
                        size={24} 
                        color={selectedMode === mode.key ? theme.colors.primary : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.travelModeText,
                        { color: selectedMode === mode.key ? theme.colors.primary : theme.colors.text }
                      ]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {touched.modeOfTravel && errors.modeOfTravel && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.modeOfTravel}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Trip Description */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Trip Description (Optional)
                </Title>
                <TextInput
                  label="Description"
                  mode="outlined"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  multiline
                  numberOfLines={3}
                  placeholder="Tell us more about your trip..."
                />
              </Card.Content>
            </Card>

            {/* Create Trip Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.buttonLabel}
            >
              {isLoading ? 'Creating Trip...' : 'Create Trip'}
            </Button>

            {/* Skip Button */}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('MainTabs')}
              style={styles.skipButton}
            >
              Skip for Now
            </Button>
          </View>
        )}
      </Formik>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={values.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setFieldValue('startDate', selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={values.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setFieldValue('endDate', selectedDate);
            }
          }}
          minimumDate={values.startDate}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  destinationItem: {
    marginBottom: 8,
  },
  destinationChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addDestinationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  addDestinationInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginBottom: 8,
  },
  travelModesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  travelModeOption: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  travelModeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
});

export default TripSetupScreen;
