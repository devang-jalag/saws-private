import json
import uuid
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.db import get_table, build_response, parse_body, validate_fields

def handler(event, context):
    """Lambda handler for Doctors CRUD.
    
    Routes:
        GET  /doctors          - list all doctors
        POST /doctors          - register a new doctor (admin)
        PUT  /doctors/{id}     - update doctor info (admin)
    """
    try:
        http_method = event.get('httpMethod')
        path_params = event.get('pathParameters') or {}

        if http_method == 'OPTIONS':
            return build_response(200, {'message': 'OK'})

        tbl = get_table('DOCTORS_TABLE_NAME')

        if http_method == 'GET':
            res = tbl.scan()
            items = res.get('Items', [])
            return build_response(200, items)

        elif http_method == 'POST':
            body = parse_body(event)
            ok, missing = validate_fields(body, ['name', 'specialty'])
            if not ok:
                return build_response(400, {
                    'error': f'Missing required fields: {", ".join(missing)}'
                })

            doc_id = str(uuid.uuid4())
            new_doc = {
                'doc_id': doc_id,
                'name': body['name'].strip(),
                'specialty': body['specialty'].strip(),
                'active': body.get('active', True)
            }
            tbl.put_item(Item=new_doc)
            return build_response(201, new_doc)

        elif http_method == 'PUT':
            doc_id = path_params.get('id')
            if not doc_id:
                return build_response(400, {'error': 'Missing doctor id in path'})

            body = parse_body(event)
            upd_exp = []
            exp_vals = {}
            exp_names = {}

            updatable = {
                'name': '#nm', 'specialty': '#sp', 'active': '#act'
            }
            for fld, alias in updatable.items():
                if fld in body:
                    upd_exp.append(f'{alias} = :{fld}')
                    exp_vals[f':{fld}'] = body[fld]
                    exp_names[alias] = fld

            if not upd_exp:
                return build_response(400, {'error': 'No valid fields to update'})

            tbl.update_item(
                Key={'doc_id': doc_id},
                UpdateExpression='SET ' + ', '.join(upd_exp),
                ExpressionAttributeValues=exp_vals,
                ExpressionAttributeNames=exp_names
            )
            return build_response(200, {
                'message': 'Doctor updated',
                'doc_id': doc_id
            })

        else:
            return build_response(405, {'error': 'Method not allowed'})

    except json.JSONDecodeError:
        return build_response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        return build_response(500, {'error': str(e)})
