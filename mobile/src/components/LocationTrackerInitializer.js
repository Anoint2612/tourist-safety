import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrackingStatus } from '../store/reducers/locationReducer';
import globalLocationTracker from '../services/globalLocationTracker';
import store from '../store';

const LocationTrackerInitializer = () => {
  const dispatch = useDispatch();
  const { isTracking } = useSelector(state => state.location);

  // Initialize the store reference for globalLocationTracker
  globalLocationTracker.store = store;

  useEffect(() => {
    // Initialize location tracking when component mounts
    const initLocationTracking = async () => {
      try {
        await globalLocationTracker.startTracking();
        console.log('Global location tracking initialized');
      } catch (error) {
        console.error('Failed to initialize location tracking:', error);
        // Error is already handled in startTracking
      }
    };

    // Only start tracking if not already tracking
    if (isTracking) {
      initLocationTracking();
    }

    // Cleanup on unmount
    return () => {
      globalLocationTracker.stopTracking();
    };
  }, [dispatch]);

  // Update tracking status when isTracking changes
  useEffect(() => {
    if (isTracking) {
      globalLocationTracker.startTracking().catch(console.error);
    } else {
      globalLocationTracker.stopTracking();
    }
  }, [isTracking]);

  return null; // This component doesn't render anything
};

export default LocationTrackerInitializer;
