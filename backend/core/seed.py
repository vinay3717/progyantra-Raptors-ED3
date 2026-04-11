import json

from roadmap.models import Roadmap, SubPoint, Unit


def seed_sample_data(db) -> None:
    existing = db.query(Roadmap).filter(Roadmap.skill_name == "web-development").first()
    if existing:
        return

    roadmap = Roadmap(
        skill_name="web-development",
        overview_text="Web development is the process of building modern, accessible, and scalable web applications.",
        career_impact="Strong web development skills unlock roles across startups, product teams, and enterprise engineering.",
        syllabus_summary=json.dumps(
            [
                "HTML foundations",
                "CSS systems and responsive layouts",
                "JavaScript core",
                "React fundamentals",
                "Backend and API integration",
            ]
        ),
        program_outcomes=json.dumps(
            [
                "Build responsive frontend applications",
                "Integrate real APIs with secure auth",
                "Ship project-ready web portfolios",
                "Prepare for technical interviews",
            ]
        ),
        difficulty_band="beginner",
        total_score=100,
    )

    unit1 = Unit(title="HTML Fundamentals", order_index=1, unit_score=30, is_locked=False)
    unit1.subpoints = [
        SubPoint(
            title="Semantic HTML and structure",
            order_index=1,
            practice_url="https://developer.mozilla.org/en-US/docs/Web/HTML",
            learning_resource_url="https://www.freecodecamp.org/news/semantic-html5-elements/",
            assessment_type="quiz",
            points_value=10,
        ),
        SubPoint(
            title="Forms and validations",
            order_index=2,
            practice_url="https://www.frontendmentor.io/",
            learning_resource_url="https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms",
            assessment_type="task",
            points_value=10,
        ),
        SubPoint(
            title="Mini portfolio section",
            order_index=3,
            practice_url="https://www.frontendmentor.io/challenges",
            learning_resource_url="https://developer.mozilla.org/en-US/docs/Learn/HTML",
            assessment_type="project",
            points_value=10,
        ),
    ]

    unit2 = Unit(title="CSS Architecture", order_index=2, unit_score=35, is_locked=True)
    unit2.subpoints = [
        SubPoint(
            title="Cascade and specificity",
            order_index=1,
            practice_url="https://specificity.keegan.st/",
            learning_resource_url="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance",
            assessment_type="quiz",
            points_value=10,
        ),
        SubPoint(
            title="Flexbox and Grid layouts",
            order_index=2,
            practice_url="https://cssgridgarden.com/",
            learning_resource_url="https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
            assessment_type="task",
            points_value=10,
        ),
        SubPoint(
            title="Responsive landing page",
            order_index=3,
            practice_url="https://www.frontendmentor.io/challenges",
            learning_resource_url="https://web.dev/learn/design",
            assessment_type="project",
            points_value=15,
        ),
    ]

    unit3 = Unit(title="JavaScript Essentials", order_index=3, unit_score=35, is_locked=True)
    unit3.subpoints = [
        SubPoint(
            title="Variables, arrays, and objects",
            order_index=1,
            assessment_type="quiz",
            points_value=10,
        ),
        SubPoint(
            title="Async operations and API calls",
            order_index=2,
            assessment_type="task",
            points_value=10,
        ),
        SubPoint(
            title="Task manager project",
            order_index=3,
            assessment_type="project",
            points_value=15,
        ),
    ]

    roadmap.units = [unit1, unit2, unit3]
    db.add(roadmap)
    db.commit()
