from enum import Enum


class FileSize(int, Enum):
    size_64 = 64
    size_128 = 128
    size_256 = 256


class Sex(str, Enum):
    male = "male"
    female = "female"


class Courses(str, Enum):
    course1 = "1"
    course2 = "2"
    course3 = "3"
    course4 = "4"
    course5 = "5"
    mag1 = "M1"
    mag2 = "M2"


class MuctrFaculties(str, Enum):
    cithin = "ЦиТХИн"
    npm = "НПМ"
    hft = "ХФТ"
    ipur = "ИПУР"
    fen = "ФЕН"


class Skills(str, Enum):
    maths = "Математика"
    cpp = "C++"
    cs = "C#"
    chem = "Химия"
    physics = "Физика"
    eng = "Инженерная графика"
    plo = "ООП"
