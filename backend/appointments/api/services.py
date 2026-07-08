import json
import uuid
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.db import get_table, build_response, parse_body, validate_fields

def handler(event, context):
    """Lambda handler for Healthcare Services CRUD.
    
    Routes:
        GET  /services          - list all active services
        POST /services          - create a new service (admin)
        PUT  /services/{id}     - update service details or pricing (admin)
    """
    try:
        http_method = event.get('httpMethod')
        path_params = event.get('pathParameters') or {}

        # handle preflight CORS
        if http_method == 'OPTIONS':
            return build_response(200, {'message': 'OK'})

        tbl = get_table('SERVICES_TABLE_NAME')

        if http_method == 'GET':
            res = tbl.scan()
            items = res.get('Items', [])
            return build_response(200, items)

        elif http_method == 'POST':
            body = parse_body(event)
            ok, missing = validate_fields(body, ['name', 'price'])
            if not ok:
                return build_response(400, {
                    'error': f'Missing required fields: {", ".join(missing)}'
                })

            srv_id = str(uuid.uuid4())
            new_srv = {
                'srv_id': srv_id,
                'name': body['name'].strip(),
                'desc': body.get('desc', '').strip(),
                'price': body['price'],
                'active': body.get('active', True)
            }
            tbl.put_item(Item=new_srv)
            return build_response(201, new_srv)

        elif http_method == 'PUT':
            srv_id = path_params.get('id')
            if not srv_id:
                return build_response(400, {'error': 'Missing service id in path'})

            body = parse_body(event)
            upd_exp = []
            exp_vals = {}
            exp_names = {}

            # allow updating name, desc, price, active
            updatable = {
                'name': '#nm', 'desc': '#ds',
                'price': '#prc', 'active': '#act'
            }
            for fld, alias in updatable.items():
                if fld in body:
                    upd_exp.append(f'{alias} = :{fld}')
                    exp_vals[f':{fld}'] = body[fld]
                    exp_names[alias] = fld

            if not upd_exp:
                return build_response(400, {'error': 'No valid fields to update'})

            tbl.update_item(
                Key={'srv_id': srv_id},
                UpdateExpression='SET ' + ', '.join(upd_exp),
                ExpressionAttributeValues=exp_vals,
                ExpressionAttributeNames=exp_names
            )
            return build_response(200, {
                'message': 'Service updated',
                'srv_id': srv_id
            })

        else:
            return build_response(405, {'error': 'Method not allowed'})

    except json.JSONDecodeError:
        return build_response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        return build_response(500, {'error': str(e)})
