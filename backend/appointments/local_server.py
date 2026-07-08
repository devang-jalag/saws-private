"""
Local development server for testing appointment APIs.
Run this from backend/appointments/ directory:
    python local_server.py

Then open your browser or Postman:
    GET  http://localhost:5000/services
    POST http://localhost:5000/services        (body: {"name":"...", "price":...})
    GET  http://localhost:5000/doctors
    POST http://localhost:5000/doctors          (body: {"name":"...", "specialty":"..."})
    GET  http://localhost:5000/appointments
    POST http://localhost:5000/appointments     (body: {"usr_id":"...", ...})
    PUT  http://localhost:5000/appointments/<id>/status  (body: {"sts":"APPROVED"})
"""
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from moto import mock_aws
import boto3

# env vars for local testing
os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
os.environ['SERVICES_TABLE_NAME'] = 'local-services'
os.environ['DOCTORS_TABLE_NAME'] = 'local-doctors'
os.environ['APPOINTMENTS_TABLE_NAME'] = 'local-appointments'

from api import services, doctors, appointments

PORT = 5000


def _setup_local_tables():
    """Create mock DynamoDB tables for the local server."""
    ddb = boto3.resource('dynamodb', region_name='us-east-1')
    ddb.create_table(
        TableName='local-services',
        KeySchema=[{'AttributeName': 'srv_id', 'KeyType': 'HASH'}],
        AttributeDefinitions=[{'AttributeName': 'srv_id', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )
    ddb.create_table(
        TableName='local-doctors',
        KeySchema=[{'AttributeName': 'doc_id', 'KeyType': 'HASH'}],
        AttributeDefinitions=[{'AttributeName': 'doc_id', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )
    ddb.create_table(
        TableName='local-appointments',
        KeySchema=[{'AttributeName': 'appt_id', 'KeyType': 'HASH'}],
        AttributeDefinitions=[
            {'AttributeName': 'appt_id', 'AttributeType': 'S'},
            {'AttributeName': 'usr_id', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST',
        GlobalSecondaryIndexes=[{
            'IndexName': 'usr_id_index',
            'KeySchema': [{'AttributeName': 'usr_id', 'KeyType': 'HASH'}],
            'Projection': {'ProjectionType': 'ALL'}
        }]
    )
    print("[OK] Mock DynamoDB tables created")


class RequestHandler(BaseHTTPRequestHandler):

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length > 0:
            return self.rfile.read(length).decode('utf-8')
        return '{}'

    def _build_event(self, method, body=None, path_params=None, query_params=None):
        return {
            'httpMethod': method,
            'body': body,
            'pathParameters': path_params,
            'queryStringParameters': query_params
        }

    def _route(self, method):
        path = self.path.split('?')[0]
        query_str = self.path.split('?')[1] if '?' in self.path else ''
        qparams = {}
        if query_str:
            for pair in query_str.split('&'):
                k, v = pair.split('=')
                qparams[k] = v

        body = self._read_body() if method in ['POST', 'PUT'] else None

        # route to the correct handler
        if path == '/services' or path.startswith('/services/'):
            parts = path.strip('/').split('/')
            pp = {'id': parts[1]} if len(parts) > 1 else None
            event = self._build_event(method, body, pp, qparams or None)
            result = services.handler(event, None)

        elif path == '/doctors' or path.startswith('/doctors/'):
            parts = path.strip('/').split('/')
            pp = {'id': parts[1]} if len(parts) > 1 else None
            event = self._build_event(method, body, pp, qparams or None)
            result = doctors.handler(event, None)

        elif path == '/appointments' or path.startswith('/appointments/'):
            parts = path.strip('/').split('/')
            pp = {'id': parts[1]} if len(parts) > 1 else None
            event = self._build_event(method, body, pp, qparams or None)
            result = appointments.handler(event, None)

        else:
            result = {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Route not found'})
            }

        # send response
        self.send_response(result['statusCode'])
        for k, v in result.get('headers', {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(result['body'].encode('utf-8'))

    def do_GET(self):
        self._route('GET')

    def do_POST(self):
        self._route('POST')

    def do_PUT(self):
        self._route('PUT')

    def do_OPTIONS(self):
        self._route('OPTIONS')


@mock_aws
def main():
    _setup_local_tables()
    server = HTTPServer(('localhost', PORT), RequestHandler)
    print(f"[OK] Server running on http://localhost:{PORT}")
    print("     Try: http://localhost:5000/services")
    print("     Press Ctrl+C to stop\n")
    server.serve_forever()


if __name__ == '__main__':
    main()
