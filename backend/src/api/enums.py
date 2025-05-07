from enum import Enum


class FileSize(int, Enum):
    size_64 = 64
    size_128 = 128
    size_256 = 256


class Sex(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class MuctrFaculties(str, Enum):
    cithin = "ЦиТХИн"
    npm = "НПМ"
    hft = "ХФТ"
    ipur = "ИПУР"
    fen = "ФЕН"
    other = "other"


class Skills(str, Enum):
    maths = "Математика"
    cpp = "C++"
    cs = "C#"