from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin
from app.models.enums import TrainTypeEnum

class Train(Base, TimestampMixin):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    train_type = Column(SQLEnum(TrainTypeEnum), default=TrainTypeEnum.EXPRESS, nullable=False)
    priority = Column(Integer, default=2, nullable=False, index=True)  # 1: Premium/Rajdhani, 2: Express, 3: Passenger, 4: Freight
    origin = Column(String(50), nullable=True)
    destination = Column(String(50), nullable=True)

    movements = relationship("TrainMovement", back_populates="train", cascade="all, delete-orphan")

class TrainMovement(Base, TimestampMixin):
    __tablename__ = "train_movements"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True, index=True)
    scheduled_arrival = Column(String(20), nullable=True)
    scheduled_departure = Column(String(20), nullable=True)
    direction = Column(String(10), default="UP")  # UP, DOWN
    line_number = Column(String(20), nullable=True)
    status = Column(String(20), default="ON_TIME")  # ON_TIME, DELAYED, ON_ROUTE
    delay_minutes = Column(Integer, default=0)
    block_window_id = Column(Integer, ForeignKey("block_windows.id"), nullable=True, index=True)

    train = relationship("Train", back_populates="movements")
    corridor = relationship("Corridor")
    station = relationship("Station")
    block_window = relationship("BlockWindow", back_populates="affected_train_movements")
