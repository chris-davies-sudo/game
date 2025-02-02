class CustomAppException(Exception):
    def __init__(self, name: str, description: str, status_code: int = 400):
        self.name = name
        self.description = description
        self.status_code = status_code
