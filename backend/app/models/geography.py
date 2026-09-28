from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin
from app.models.enums import DepartmentEnum

class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SQLEnum(DepartmentEnum), nullable=False)

    tasks = relationship("MaintenanceTask", back_populates="department")

class Zone(Base, TimestampMixin):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    headquarters = Column(String(100), nullable=True)

    divisions = relationship("Division", back_populates="zone", cascade="all, delete-orphan")

class Division(Base, TimestampMixin):
    __tablename__ = "divisions"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)

    zone = relationship("Zone", back_populates="divisions")
    corridors = relationship("Corridor", back_populates="division", cascade="all, delete-orphan")

class Corridor(Base, TimestampMixin):
    __tablename__ = "corridors"

    id = Column(Integer, primary_key=True, index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    from_station = Column(String(50), nullable=True)
    to_station = Column(String(50), nullable=True)
    distance_km = Column(Float, nullable=True)
    max_speed_kmph = Column(Integer, nullable=True)

    division = relationship("Division", back_populates="corridors")
    stations = relationship("Station", back_populates="corridor", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="corridor")

class Station(Base, TimestampMixin):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    line_count = Column(Integer, default=2)

    corridor = relationship("Corridor", back_populates="stations")
    assets = relationship("Asset", back_populates="station")

class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=True, index=True)
    asset_code = Column(String(50), unique=True, nullable=False, index=True)
    asset_type = Column(String(50), nullable=False, index=True)  # TRACK, SIGNAL, OHE, POINT, BRIDGE
    location = Column(String(100), nullable=True)
    condition = Column(String(50), default="FAIR")  # GOOD, FAIR, DEGRADED, POOR, FAILED
    line_number = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    station = relationship("Station", back_populates="assets")
    corridor = relationship("Corridor", back_populates="assets")
    maintenance_tasks = relationship("MaintenanceTask", back_populates="asset")
