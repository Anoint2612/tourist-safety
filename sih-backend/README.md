# Geofencing Tourist Safety API

A comprehensive geo-fence management system for tourist safety with real-time location tracking, automatic alert generation, and WebSocket support for real-time notifications.

## Features

### 🗺️ Zone Management
- **Safe Zones**: No alerts generated when tourists enter
- **Risky Zones**: Warning alerts generated
- **Restricted Zones**: High-priority alerts generated
- Support for complex polygon shapes using PostGIS
- CRUD operations for zone management

### 👥 Tourist Tracking
- Real-time location updates with GPS coordinates
- Automatic tourist registration
- Location history tracking
- Support for multiple tourists simultaneously

### 🚨 Alert System
- Automatic geo-fence checking using PostGIS spatial queries
- Real-time alert generation
- Alert categorization (warning/high-priority)
- Alert resolution tracking
- Comprehensive alert statistics

### 🔌 Real-time Notifications
- WebSocket support for real-time alerts
- Separate endpoints for different client types:
  - Dashboard clients
  - Police monitoring systems
  - Administrative interfaces

### 📊 API Features
- RESTful API with comprehensive documentation
- Swagger UI for interactive testing
- Request/response validation with Pydantic
- Pagination and filtering support
- Health check endpoints

## Technology Stack

- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with PostGIS extension
- **Spatial Queries**: PostGIS functions (ST_Contains, ST_Within)
- **Real-time**: WebSocket support
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger UI / OpenAPI

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sih-backend
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready**
   ```bash
   # Check if all services are healthy
   docker-compose ps
   ```

4. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health
   - WebSocket: ws://localhost:8000/ws/alerts

## API Endpoints

### Zone Management
- `POST /api/v1/zones` - Create a new zone
- `GET /api/v1/zones` - List all zones (with filtering)
- `GET /api/v1/zones/{id}` - Get specific zone
- `PUT /api/v1/zones/{id}` - Update zone
- `DELETE /api/v1/zones/{id}` - Delete zone (soft delete)

### Tourist Management
- `POST /api/v1/tourists` - Create a new tourist
- `GET /api/v1/tourists` - List all tourists

### Location Tracking
- `POST /api/v1/location` - Update tourist location
- `GET /api/v1/location/{tourist_id}` - Get tourist location history

### Alert Management
- `GET /api/v1/alerts` - List alerts (with filtering)
- `PUT /api/v1/alerts/{id}` - Update alert status
- `GET /api/v1/alerts/stats` - Get alert statistics

### WebSocket Endpoints
- `ws://localhost:8000/ws/alerts` - General alerts endpoint
- `ws://localhost:8000/ws/dashboard` - Dashboard clients
- `ws://localhost:8000/ws/police` - Police monitoring
- `ws://localhost:8000/ws/admin` - Administrative interface

## Usage Examples

### Creating a Zone

```bash
curl -X POST "http://localhost:8000/api/v1/zones" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restricted Military Area",
    "description": "Off-limits military installation",
    "zone_type": "restricted",
    "wkt_polygon": "POLYGON((91.85 25.5, 91.95 25.5, 91.95 25.6, 91.85 25.6, 91.85 25.5))",
    "is_active": true
  }'
```

### Updating Tourist Location

```bash
curl -X POST "http://localhost:8000/api/v1/location" \
  -H "Content-Type: application/json" \
  -d '{
    "tourist_id": "tourist_001",
    "latitude": 25.55,
    "longitude": 91.9,
    "accuracy": 10.5,
    "speed": 2.3,
    "heading": 45.0
  }'
```

### WebSocket Connection (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/alerts?client_type=dashboard');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'alert') {
        console.log('New alert:', data.data.alert);
    }
};
```

## Simulation

The system includes a comprehensive simulator that:

- Creates sample zones automatically
- Simulates 5 tourists with different movement patterns:
  - Random walk
  - Linear path
  - Circular movement
- Generates realistic GPS data with accuracy, speed, and heading
- Demonstrates automatic alert generation

### Running the Simulator

The simulator starts automatically with the Docker Compose setup. You can also run it manually:

```bash
# If running outside Docker
cd simulator
python simulator.py
```

## Database Schema

### Tables

1. **zones** - Geo-fence zones with PostGIS polygons
2. **tourists** - Tourist information and metadata
3. **location_events** - Historical location data
4. **alerts** - Generated alerts with resolution tracking

### Spatial Data

- Uses PostGIS for spatial operations
- All coordinates in WGS84 (SRID: 4326)
- Spatial indexes automatically created for performance

## Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for security (change in production)
- `LOG_LEVEL`: Logging level (INFO, DEBUG, etc.)

### Docker Configuration

- Health checks for all services
- Proper service dependencies
- Volume mounts for development
- Security best practices

## Development

### Running in Development Mode

```bash
# Start only the database
docker-compose up -d db

# Run backend locally
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Run simulator locally
cd simulator
python simulator.py
```

### Testing

1. **API Testing**: Use Swagger UI at http://localhost:8000/docs
2. **WebSocket Testing**: Use browser developer tools or WebSocket clients
3. **Simulation Testing**: Monitor logs to see alert generation

## Production Deployment

### Security Considerations

1. Change default passwords and secret keys
2. Configure proper CORS settings
3. Use HTTPS for WebSocket connections
4. Implement authentication/authorization
5. Set up proper logging and monitoring

### Performance Optimization

1. Configure PostgreSQL for production workloads
2. Set up connection pooling
3. Implement caching for frequently accessed data
4. Monitor spatial query performance

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running and accessible
   - Check DATABASE_URL format
   - Verify PostGIS extension is installed

2. **WebSocket Connection Issues**
   - Check firewall settings
   - Ensure proper WebSocket URL format
   - Verify client_type parameter

3. **Spatial Query Errors**
   - Validate WKT polygon format
   - Check coordinate system (should be WGS84)
   - Ensure PostGIS functions are available

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f simulator
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the logs for error details
