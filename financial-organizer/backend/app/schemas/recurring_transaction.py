from datetime import date, datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field, validator


class FrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class RecurringTransactionBase(BaseModel):
    amount: float = Field(..., ge=0)
    transaction_type: str
    category: str
    description: Optional[str] = None
    frequency: FrequencyEnum
    start_date: date
    end_date: Optional[date] = None
    next_date: Optional[date] = None
    

class RecurringTransactionCreate(RecurringTransactionBase):
    @validator('transaction_type', 'category')
    def convert_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class RecurringTransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, ge=0)
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[FrequencyEnum] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    next_date: Optional[date] = None
    is_active: Optional[bool] = None

    @validator('transaction_type', 'category')
    def convert_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and values['start_date'] and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class RecurringTransactionInDBBase(RecurringTransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    next_date: date

    class Config:
        orm_mode = True


class RecurringTransaction(RecurringTransactionInDBBase):
    pass 