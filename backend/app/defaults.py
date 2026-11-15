from sqlalchemy.orm import Session

from app.models import Category, User

# Colours follow a validated categorical order: distinct for colour-blind readers
# when neighbouring categories sit side by side in a chart. Keep the order.
DEFAULT_CATEGORIES: list[tuple[str, str, str]] = [
    ("Foods", "#2a78d6", "food"),
    ("Transport", "#eb6834", "transport"),
    ("Data & Mobile", "#1baf7a", "mobile"),
    ("Education", "#eda100", "education"),
    ("Materials", "#e87ba4", "materials"),
    ("Clothes", "#008300", "clothes"),
    ("Donations", "#4a3aa7", "donations"),
    ("Other", "#e34948", "other"),
]


def seed_default_categories(db: Session, user: User) -> None:
    for position, (name, color, icon) in enumerate(DEFAULT_CATEGORIES):
        db.add(
            Category(
                user=user,
                name=name,
                color=color,
                icon=icon,
                is_custom=False,
                is_fallback=icon == "other",
                position=position,
            )
        )
