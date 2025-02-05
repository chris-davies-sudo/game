import datetime

from mongoengine import Document, StringField, FloatField, IntField, DateTimeField

class Category(Document):
    name = StringField(required=True)  # Removed unique=True
    description = StringField(required=True)
    category = StringField(required=True, choices=["dare", "truth", "scenario", "mystery", "blank"])
    type = StringField(required=True, choices=["lust", "love"])
    point_reward = IntField(required=True, min_value=0)
    probability = FloatField(required=True, min_value=0.0, max_value=1.0)
    colour = StringField(required=True)
    usage = IntField(required=True, min_value=0)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    meta = {
        "collection": "categories",
        "indexes": [
            {"fields": ["name", "category", "type"], "unique": True},  # Ensuring uniqueness across name + category + type
            "category",
            "type"
        ],
        "ordering": ["-created_at"]
    }

    def save(self, *args, **kwargs):
        """Override save method to auto-update 'updated_at' timestamp."""
        self.updated_at = datetime.datetime.now()
        return super(Category, self).save(*args, **kwargs)
