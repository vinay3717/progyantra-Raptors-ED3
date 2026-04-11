import json

from roadmap.models import Roadmap, Unit, SubPoint


def seed_sample_data(db):
    if db.query(Roadmap).first():
        return

    roadmap = Roadmap(
        skill_name="python",
        overview_text="Build a strong Python foundation from syntax to real-world applications.",
        career_impact="Python is widely used in backend development, data engineering, automation, and AI workflows.",
        syllabus_summary=json.dumps(
            [
                "Syntax and core data types",
                "Functions, modules, and packages",
                "Object-oriented programming",
                "File handling and error management",
                "APIs, SQL, and automation basics",
            ]
        ),
        difficulty_band="beginner",
        total_score=100,
    )

    unit1 = Unit(title="Python Fundamentals", order_index=1, unit_score=30, is_locked=False)
    unit1.subpoints = [
        SubPoint(
            title="Variables, types, and operators",
            order_index=1,
            practice_url="https://www.hackerrank.com/domains/python",
            learning_resource_url="https://docs.python.org/3/tutorial/",
            assessment_type="quiz",
        ),
        SubPoint(
            title="Control flow and loops",
            order_index=2,
            practice_url="https://www.codewars.com/kata/search/python",
            learning_resource_url="https://docs.python.org/3/tutorial/controlflow.html",
            assessment_type="quiz",
        ),
    ]

    unit2 = Unit(title="Python in Practice", order_index=2, unit_score=40, is_locked=False)
    unit2.subpoints = [
        SubPoint(
            title="Functions and modules",
            order_index=1,
            practice_url="https://realpython.com/python-modules-packages/",
            learning_resource_url="https://docs.python.org/3/tutorial/modules.html",
            assessment_type="coding",
        ),
        SubPoint(
            title="Working with files and errors",
            order_index=2,
            practice_url="https://www.geeksforgeeks.org/file-handling-python/",
            learning_resource_url="https://docs.python.org/3/tutorial/inputoutput.html",
            assessment_type="coding",
        ),
    ]

    unit3 = Unit(title="Backend Readiness", order_index=3, unit_score=30, is_locked=False)
    unit3.subpoints = [
        SubPoint(
            title="HTTP APIs with FastAPI",
            order_index=1,
            practice_url="https://fastapi.tiangolo.com/tutorial/",
            learning_resource_url="https://fastapi.tiangolo.com/",
            assessment_type="project",
        ),
        SubPoint(
            title="SQLAlchemy and SQLite",
            order_index=2,
            practice_url="https://docs.sqlalchemy.org/",
            learning_resource_url="https://docs.sqlalchemy.org/en/20/orm/quickstart.html",
            assessment_type="project",
        ),
    ]

    roadmap.units = [unit1, unit2, unit3]
    db.add(roadmap)
    db.commit()