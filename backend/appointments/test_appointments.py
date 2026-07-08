import os
import json
import unittest
from moto import mock_aws
import boto3

# set up env vars before importing handlers
os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
os.environ['SERVICES_TABLE_NAME'] = 'test-services'
os.environ['DOCTORS_TABLE_NAME'] = 'test-doctors'
os.environ['APPOINTMENTS_TABLE_NAME'] = 'test-appointments'

from api import services, doctors, appointments


@mock_aws
class TestServicesAPI(unittest.TestCase):

    def setUp(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.dynamodb.create_table(
            TableName='test-services',
            KeySchema=[{'AttributeName': 'srv_id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'srv_id', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )

    def test_create_service(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Therapy', 'price': 100})
        }
        res = services.handler(event, None)
        self.assertEqual(res['statusCode'], 201)
        data = json.loads(res['body'])
        self.assertEqual(data['name'], 'Therapy')
        self.assertIn('srv_id', data)

    def test_create_service_missing_fields(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Therapy'})
        }
        res = services.handler(event, None)
        self.assertEqual(res['statusCode'], 400)
        self.assertIn('price', json.loads(res['body'])['error'])

    def test_get_services(self):
        # seed a service first
        services.handler({
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Checkup', 'price': 50})
        }, None)
        res = services.handler({'httpMethod': 'GET'}, None)
        self.assertEqual(res['statusCode'], 200)
        items = json.loads(res['body'])
        self.assertEqual(len(items), 1)

    def test_update_service(self):
        # create then update
        create_res = services.handler({
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Yoga', 'price': 40})
        }, None)
        srv_id = json.loads(create_res['body'])['srv_id']

        update_res = services.handler({
            'httpMethod': 'PUT',
            'pathParameters': {'id': srv_id},
            'body': json.dumps({'price': 60})
        }, None)
        self.assertEqual(update_res['statusCode'], 200)

    def test_cors_headers(self):
        res = services.handler({'httpMethod': 'GET'}, None)
        self.assertIn('Access-Control-Allow-Origin', res['headers'])
        self.assertEqual(res['headers']['Access-Control-Allow-Origin'], '*')


@mock_aws
class TestDoctorsAPI(unittest.TestCase):

    def setUp(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.dynamodb.create_table(
            TableName='test-doctors',
            KeySchema=[{'AttributeName': 'doc_id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'doc_id', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )

    def test_create_doctor(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Dr. Smith', 'specialty': 'Therapist'})
        }
        res = doctors.handler(event, None)
        self.assertEqual(res['statusCode'], 201)
        data = json.loads(res['body'])
        self.assertEqual(data['name'], 'Dr. Smith')

    def test_create_doctor_missing_fields(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Dr. Jones'})
        }
        res = doctors.handler(event, None)
        self.assertEqual(res['statusCode'], 400)

    def test_list_doctors(self):
        doctors.handler({
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Dr. A', 'specialty': 'General'})
        }, None)
        doctors.handler({
            'httpMethod': 'POST',
            'body': json.dumps({'name': 'Dr. B', 'specialty': 'Cardio'})
        }, None)
        res = doctors.handler({'httpMethod': 'GET'}, None)
        items = json.loads(res['body'])
        self.assertEqual(len(items), 2)


@mock_aws
class TestAppointmentsAPI(unittest.TestCase):

    def setUp(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.dynamodb.create_table(
            TableName='test-appointments',
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

    def test_book_appointment(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({
                'usr_id': 'u001', 'doc_id': 'd001', 'srv_id': 's001',
                'date': '2026-10-10', 'time': '10:00'
            })
        }
        res = appointments.handler(event, None)
        self.assertEqual(res['statusCode'], 201)
        data = json.loads(res['body'])
        self.assertEqual(data['sts'], 'PENDING')
        self.assertIn('created_at', data)

    def test_book_appointment_missing_fields(self):
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({'usr_id': 'u001', 'doc_id': 'd001'})
        }
        res = appointments.handler(event, None)
        self.assertEqual(res['statusCode'], 400)

    def test_approve_appointment(self):
        # book first
        create_res = appointments.handler({
            'httpMethod': 'POST',
            'body': json.dumps({
                'usr_id': 'u001', 'doc_id': 'd001', 'srv_id': 's001',
                'date': '2026-10-10', 'time': '10:00'
            })
        }, None)
        appt_id = json.loads(create_res['body'])['appt_id']

        # approve
        res = appointments.handler({
            'httpMethod': 'PUT',
            'pathParameters': {'id': appt_id},
            'body': json.dumps({'sts': 'APPROVED'})
        }, None)
        self.assertEqual(res['statusCode'], 200)

    def test_invalid_status_rejected(self):
        create_res = appointments.handler({
            'httpMethod': 'POST',
            'body': json.dumps({
                'usr_id': 'u001', 'doc_id': 'd001', 'srv_id': 's001',
                'date': '2026-10-10', 'time': '10:00'
            })
        }, None)
        appt_id = json.loads(create_res['body'])['appt_id']

        res = appointments.handler({
            'httpMethod': 'PUT',
            'pathParameters': {'id': appt_id},
            'body': json.dumps({'sts': 'GARBAGE'})
        }, None)
        self.assertEqual(res['statusCode'], 400)
        self.assertIn('Invalid status', json.loads(res['body'])['error'])

    def test_get_by_user(self):
        # book 2 for u001, 1 for u002
        for uid in ['u001', 'u001', 'u002']:
            appointments.handler({
                'httpMethod': 'POST',
                'body': json.dumps({
                    'usr_id': uid, 'doc_id': 'd001', 'srv_id': 's001',
                    'date': '2026-10-10', 'time': '10:00'
                })
            }, None)

        res = appointments.handler({
            'httpMethod': 'GET',
            'queryStringParameters': {'usr_id': 'u001'}
        }, None)
        items = json.loads(res['body'])
        self.assertEqual(len(items), 2)

    def test_get_all_admin(self):
        appointments.handler({
            'httpMethod': 'POST',
            'body': json.dumps({
                'usr_id': 'u001', 'doc_id': 'd001', 'srv_id': 's001',
                'date': '2026-10-10', 'time': '10:00'
            })
        }, None)
        res = appointments.handler({
            'httpMethod': 'GET',
            'queryStringParameters': None
        }, None)
        items = json.loads(res['body'])
        self.assertEqual(len(items), 1)


if __name__ == '__main__':
    unittest.main()
