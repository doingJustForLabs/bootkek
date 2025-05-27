from fastapi import APIRouter

from api.enums import MuctrFaculties, Skills, Courses, Sex
from api.enums.schemas import EnumResponseModel

router = APIRouter(prefix="/enums", tags=["Enums"])


@router.get("/courses", response_model=EnumResponseModel)
async def get_courses_enums():
    return EnumResponseModel(type="courses", enums=[course.value for course in Courses])


@router.get("/skills", response_model=EnumResponseModel)
async def get_skills_enums():
    return EnumResponseModel(type="skills", enums=[skill.value for skill in Skills])


@router.get("/faculties", response_model=EnumResponseModel)
async def get_faculties_enums():
    return EnumResponseModel(
        type="faculties", enums=[faculty.value for faculty in MuctrFaculties]
    )


@router.get("/sex", response_model=EnumResponseModel)
async def get_sex_enums():
    return EnumResponseModel(type="sex", enums=[sex.value for sex in Sex])
