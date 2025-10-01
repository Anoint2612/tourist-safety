import LocationTrackingService from '../locationTrackingService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LocationTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LocationTrackingService.stopTracking();
  });

  afterEach(() => {
    LocationTrackingService.stopTracking();
  });

  test('should start tracking when startTracking is called', async () => {
    const mockUserData = { id: 'test-user-123' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserData));
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await LocationTrackingService.startTracking();

    expect(LocationTrackingService.isCurrentlyTracking()).toBe(true);
  });

  test('should stop tracking when stopTracking is called', () => {
    LocationTrackingService.stopTracking();
    expect(LocationTrackingService.isCurrentlyTracking()).toBe(false);
  });

  test('should send dummy location data with correct format', async () => {
    const mockUserData = { id: 'test-user-123' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserData));
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await LocationTrackingService.startTracking();

    // Wait for initial location send
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fetch).toHaveBeenCalledWith(
      'http://10.20.57.131:5000/location',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourist_id: 'test-user-123',
          latitude: 13.3439,
          longitude: 74.7475,
          accuracy: 5,
          speed: 0,
          heading: 0
        })
      })
    );
  });

  test('should use default tourist ID when user data is not available', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await LocationTrackingService.startTracking();

    // Wait for initial location send
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fetch).toHaveBeenCalledWith(
      'http://10.20.57.131:5000/location',
      expect.objectContaining({
        body: JSON.stringify({
          tourist_id: 'demo-tourist-001',
          latitude: 13.3439,
          longitude: 74.7475,
          accuracy: 5,
          speed: 0,
          heading: 0
        })
      })
    );
  });
});
