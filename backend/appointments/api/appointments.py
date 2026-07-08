import json
import uuid
import sys
import os
from datetime import datetime
from boto3.dynamodb.conditions import Key

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.db import (
    get_table, build_response, parse_body,
    validate_fields, VALID_STS
)

def handler(event, context):
    """Lambda handler for Appointments CRUD.
    
    Routes:
        GET  /appointments              - list all (admin) or by usr_id (patient)
        POST /appointments              - book a new appointment (patient)
        PUT  /appointments/{id}/status  - approve/reject/cancel
    """
    try:
        http_method = event.get('httpMethod')
        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}

        if http_method == 'OPTIONS':
            return build_response(200, {'message': 'OK'})

        tbl = get_table('APPOINTMENTS_TABLE_NAME')

        if http_method == 'GET':
            usr_id = query_params.get('usr_id')
            if usr_id:
                # patient view: query GSI for their appointments only
                res = tbl.query(
                    IndexName='usr_id_index',
                    KeyConditionExpression=Key('usr_id').eq(usr_id)
                )
                items = res.get('Items', [])
            else:
                # admin view: scan everything
                res = tbl.scan()
                items = res.get('Items', [])
            return build_response(200, items)

        elif http_method == 'POST':
            body = parse_body(event)
            ok, missing = validate_fields(
                body, ['usr_id', 'doc_id', 'srv_id', 'date', 'time']
            )
            if not ok:
                return build_response(400, {
                    'error': f'Missing required fields: {", ".join(missing)}'
                })

            appt_id = str(uuid.uuid4())
            now_ts = datetime.utcnow().isoformat() + 'Z'
            new_appt = {
                'appt_id': appt_id,
                'usr_id': body['usr_id'].strip(),
                'doc_id': body['doc_id'].strip(),
                'srv_id': body['srv_id'].strip(),
                'date': body['date'].strip(),
                'time': body['time'].strip(),
                'sts': 'PENDING',
                'created_at': now_ts
            }
            tbl.put_item(Item=new_appt)
            return build_response(201, new_appt)

        elif http_method == 'PUT':
            appt_id = path_params.get('id')
            if not appt_id:
                return build_response(400, {
                    'error': 'Missing appointment id in path'
                })

            body = parse_body(event)
            new_sts = body.get('sts')
            if not new_sts:
                return build_response(400, {
                    'error': 'Missing sts field in body'
                })

            # validate status value
            if new_sts not in VALID_STS:
                return build_response(400, {
                    'error': f'Invalid status. Must be one of: {VALID_STS}'
                })

            tbl.update_item(
                Key={'appt_id': appt_id},
                UpdateExpression='SET sts = :sts',
                ExpressionAttributeValues={':sts': new_sts}
            )
            return build_response(200, {
                'message': f'Appointment status updated to {new_sts}',
                'appt_id': appt_id
            })

        else:
            return build_response(405, {'error': 'Method not allowed'})

    except json.JSONDecodeError:
        return build_response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        return build_response(500, {'error': str(e)})
