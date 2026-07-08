import boto3
import os
import json
from decimal import Decimal

# valid status transitions for appointments
VALID_STS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

# Helper to convert decimals to standard types for JSON serialization
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_table(tbl_name_env):
    rgn = os.environ.get('AWS_DEFAULT_REGION', 'us-east-1')
    dynamodb = boto3.resource('dynamodb', region_name=rgn)
    tbl_name = os.environ.get(tbl_name_env)
    return dynamodb.Table(tbl_name)

def build_response(status_code, body):
    """Standard API Gateway response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def parse_body(event):
    """Safely parse JSON body from API Gateway event."""
    raw = event.get('body', '{}')
    if raw is None:
        raw = '{}'
    return json.loads(raw)

def validate_fields(data, required_fields):
    """Check that all required fields exist and are non-empty."""
    missing = []
    for fld in required_fields:
        val = data.get(fld)
        if val is None or (isinstance(val, str) and val.strip() == ''):
            missing.append(fld)
    if missing:
        return False, missing
    return True, []
