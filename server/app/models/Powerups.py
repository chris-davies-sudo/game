import datetime

from mongoengine import Document, StringField, BooleanField, IntField, DateTimeField

class PowerUp(Document):
    name = StringField(required=True)  # Removed unique=True
    description = StringField(required=True)
    type = StringField(required=True, choices=["information", "tactic", "power"])
    sub_type = BooleanField(default=False)
    cost = IntField(required=True, min_value=0)
    effect = StringField(default="")  
    taken = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    meta = {
        "collection": "powerups",
        "indexes": [
            {"fields": ["name", "type", "effect", "cost"], "unique": True} 
        ],
        "ordering": ["-created_at"]
    }

    def save(self, *args, **kwargs):
        """Override save method to auto-update 'updated_at' timestamp."""
        self.updated_at = datetime.datetime.now()
        return super(PowerUp, self).save(*args, **kwargs)
