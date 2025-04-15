from enum import Enum


class FileSize(int, Enum):
    size_64 = 64
    size_128 = 128
    size_256 = 256


class Sex(Enum):
    male: str = "male"
    female: str = "female"
    other: str = "other"


class MuctrFaculties(Enum):
    cithin: str = "ЦиТХИн"
    npm: str = "НПМ"
    hft: str = "ХФТ"
    ipur: str = "ИПУР"
    fen: str = "ФЕН"
    other: str = "other"
