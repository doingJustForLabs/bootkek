"""rename bad enums

Revision ID: 7edd8973ef32
Revises: 1c64cbb8aa68
Create Date: 2025-05-30 23:48:27.753302

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from api.enums import MuctrFaculties, Courses
from api.profiles.models import Profile

# revision identifiers, used by Alembic.
revision: str = "7edd8973ef32"
down_revision: Union[str, None] = "1c64cbb8aa68"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


faculties = {
    "cithin": "ЦиТХИн",
    "npm": "НПМ",
    "hft": "ХФТ",
    "ipur": "ИПУР",
    "fen": "ФЕН",
}

courses = {
    "course1": "1",
    "course2": "2",
    "course3": "3",
    "course4": "4",
    "course5": "5",
    "mag1": "M1",
    "mag2": "M2",
}


old_faculties_enum = postgresql.ENUM(
    *faculties, name="muctrfaculties", create_type=True
)

old_courses_enum = postgresql.ENUM(*courses, name="courses", create_type=True)

new_faculties_enum = postgresql.ENUM(
    *[faculty.value for faculty in MuctrFaculties],
    name="faculties_enum",
    create_type=True,
)

new_courses_enum = postgresql.ENUM(
    *[course.value for course in Courses],
    name="courses_enum",
    create_type=True,
)


def update_faculties():
    # Создаем новый столбец и заменяем старые enum
    op.add_column("profiles", sa.Column("faculty_new", sa.String, nullable=True))

    for key, value in faculties.items():
        op.execute(
            f"""
                UPDATE profiles
                SET faculty_new = '{value}'
                WHERE faculty = '{key}'
            """
        )

    # Заменяем новый столбец на старый
    op.drop_column("profiles", "faculty")
    op.alter_column("profiles", "faculty_new", new_column_name="faculty")

    # Создаем новый тип
    new_faculties_enum.create(op.get_bind())

    # Обновляем тип столбца Faculty
    op.alter_column(
        "profiles",
        "faculty",
        type_=new_faculties_enum,
        postgresql_using="faculty::text::faculties_enum",
    )

    old_faculties_enum.drop(op.get_bind())


def update_courses():
    # Создаем новый столбец и заменяем старые enum
    op.add_column("profiles", sa.Column("course_new", sa.String, nullable=True))

    for key, value in courses.items():
        op.execute(
            f"""
                    UPDATE profiles
                    SET course_new = '{value}'
                    WHERE course = '{key}'
                """
        )

    # Заменяем новый столбец на старый
    op.drop_column("profiles", "course")
    op.alter_column("profiles", "course_new", new_column_name="course")

    # Создаем новый тип
    new_courses_enum.create(op.get_bind())

    # Обновляем тип столбца Faculty
    op.alter_column(
        "profiles",
        "course",
        type_=new_courses_enum,
        postgresql_using="course::text::courses_enum",
    )

    old_courses_enum.drop(op.get_bind())


def downgrade_faculties():
    # Создаем новый столбец и заменяем новые enum
    op.add_column("profiles", sa.Column("faculty_old", sa.String, nullable=True))

    for key, value in faculties.items():
        op.execute(
            f"""
                UPDATE profiles
                SET faculty_old = '{key}'
                WHERE faculty = '{value}'
            """
        )

    # Заменяем старый столбец на новый
    op.drop_column("profiles", "faculty")
    op.alter_column("profiles", "faculty_old", new_column_name="faculty")

    old_faculties_enum.create(op.get_bind())

    # Обновляем тип столбца Faculty
    op.alter_column(
        "profiles",
        "faculty",
        type_=old_faculties_enum,
        postgresql_using="faculty::text::muctrfaculties",
    )

    # Удаляем новый тип
    new_faculties_enum.drop(op.get_bind())


def downgrade_courses():
    # Создаем новый столбец и заменяем новые enum
    op.add_column("profiles", sa.Column("course_old", sa.String, nullable=True))

    for key, value in courses.items():
        op.execute(
            f"""
                UPDATE profiles
                SET course_old = '{key}'
                WHERE course = '{value}'
            """
        )

    # Заменяем старый столбец на новый
    op.drop_column("profiles", "course")
    op.alter_column("profiles", "course_old", new_column_name="course")

    old_courses_enum.create(op.get_bind())

    # Обновляем тип столбца Faculty
    op.alter_column(
        "profiles",
        "course",
        type_=old_courses_enum,
        postgresql_using="course::text::courses",
    )

    # Удаляем новый тип
    new_courses_enum.drop(op.get_bind())


def upgrade() -> None:
    """Upgrade schema."""

    # update_faculties()
    # update_courses()


def downgrade() -> None:
    """Downgrade schema."""

    # downgrade_faculties()
    # downgrade_courses()
