import datetime
from .Powerups import PowerUp
from .Profile import UserProfile
from .Categories import Category

from mongoengine import Document, StringField, ReferenceField, DateTimeField, IntField

class UserEvent(Document):
    user = ReferenceField(UserProfile, required=True)
    event_type = StringField(required=True, choices=["spin", "powerup_purchase"])
    category = ReferenceField(Category, required=False)  # Only for "spin" events
    powerup = ReferenceField(PowerUp, required=False)  # Only for "powerup_purchase" events
    points_earned = IntField(default=0)  # Points earned from spinning
    timestamp = DateTimeField(default=datetime.datetime.now)

    meta = {
        "collection": "user_events",
        "indexes": ["user", "event_type", "timestamp"],
        "ordering": ["-timestamp"]
    }

    def save(self, *args, **kwargs):
        """Override save method to auto-update 'timestamp'."""
        self.timestamp = datetime.datetime.now()
        return super(UserEvent, self).save(*args, **kwargs)