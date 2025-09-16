from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from .config import DATABASE_URL
from .models import Base
import logging

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Initialize database with PostGIS extension"""
    async with engine.begin() as conn:
        # Enable PostGIS extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")

async def close_db():
    """Close database connections"""
    await engine.dispose()
    logger.info("Database connections closed")

# Database utility functions
async def execute_spatial_query(session: AsyncSession, query: str, params: dict = None):
    """Execute a spatial query with PostGIS functions"""
    try:
        result = await session.execute(text(query), params or {})
        return result.fetchall()
    except Exception as e:
        logger.error(f"Spatial query error: {e}")
        raise

async def check_point_in_polygon(session: AsyncSession, lat: float, lng: float):
    """Check if a point is inside any zone using PostGIS ST_Contains"""
    query = text("""
        SELECT z.id, z.name, z.zone_type, z.description
        FROM zones z
        WHERE z.is_active = true 
        AND ST_Contains(z.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
        ORDER BY 
            CASE z.zone_type 
                WHEN 'restricted' THEN 1 
                WHEN 'risky' THEN 2 
                WHEN 'safe' THEN 3 
            END
    """)
    
    result = await session.execute(query, {"lng": lng, "lat": lat})
    return result.fetchall()

async def get_tourist_by_id(session: AsyncSession, tourist_id: str):
    """Get tourist by tourist_id"""
    from .models import Tourist
    from sqlalchemy.future import select
    
    result = await session.execute(
        select(Tourist).where(Tourist.tourist_id == tourist_id)
    )
    return result.scalar_one_or_none()

async def create_or_get_tourist(session: AsyncSession, tourist_id: str, name: str = None):
    """Create or get existing tourist"""
    from .models import Tourist
    from sqlalchemy.future import select
    
    # Try to get existing tourist
    result = await session.execute(
        select(Tourist).where(Tourist.tourist_id == tourist_id)
    )
    tourist = result.scalar_one_or_none()
    
    if not tourist:
        # Create new tourist
        tourist = Tourist(tourist_id=tourist_id, name=name)
        session.add(tourist)
        await session.commit()
        await session.refresh(tourist)
    
    return tourist
