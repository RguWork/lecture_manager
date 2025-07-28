from storages.backends.s3boto3 import S3Boto3Storage

class NoteUploadS3Storage(S3Boto3Storage):
    location = "notes"