import datetime

from mongoengine import Document, StringField, BooleanField, IntField, DateTimeField

class UserProfile(Document):
    player_name = StringField(required=True)
    username = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    points = IntField(default=0, min_value=0)
    active = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    meta = {
        "collection": "users",
        "indexes": ["username"],
        "ordering": ["-created_at"]
    }

    def save(self, *args, **kwargs):
        """Override save method to auto-update 'updated_at' timestamp."""
        self.updated_at = datetime.datetime.now()
        return super(UserProfile, self).save(*args, **kwargs)