import json
import boto3
import uuid
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VehicleInsuranceData')

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")

        if 'httpMethod' in event and event['httpMethod'] == 'GET':
            return handle_get(event)

        if 'body' not in event or not event['body']:
            print("Error: Missing body in event")
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Bad Request: Missing body'}),
                'headers': get_cors_headers()
            }

        body = json.loads(event['body'])
        print(f"Parsed body: {json.dumps(body)}")

        # Check if the registration number already exists
        response = table.scan(
            FilterExpression="registrationNumber = :reg_num",
            ExpressionAttributeValues={":reg_num": body['registrationNumber']}
        )
        print(f"Scan response: {json.dumps(response)}")

        if response['Items']:
            return {
                'statusCode': 409,
                'body': json.dumps({'message': 'Vehicle registration number already exists. Refresh this page to add a new vehicle'}),
                'headers': get_cors_headers()
            }

        # Calculate expiry date (Today + 1 Year)
        expiry_date = (datetime.utcnow() + timedelta(days=365)).strftime('%Y-%m-%d')

        # Insert new record with expiryDate
        vehicle_data = {
            'userId': body['userId'],
            'insuranceId': str(uuid.uuid4()),
            'registrationNumber': body['registrationNumber'],
            'make': body.get('make', ''),
            'model': body.get('model', ''),
            'serviceDate': body.get('serviceDate', ''),
            'insuranceType': body.get('insuranceType', 'Standard'),
            'price': body.get('price', 100),
            'expiryDate': expiry_date,  
        }
        print(f"Insert data: {json.dumps(vehicle_data)}")
        table.put_item(Item=vehicle_data)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Insurance data saved successfully! Redirecting to Policies in 3 seconds ...'}),
            'headers': get_cors_headers()
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to process request', 'error': str(e)}),
            'headers': get_cors_headers()
        }

def handle_get(event):
    if 'queryStringParameters' not in event or 'userId' not in event['queryStringParameters']:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Missing userId query parameter'}),
            'headers': get_cors_headers()
        }

    user_id = event['queryStringParameters']['userId'].strip()
    print(f"Received userId: '{user_id}'")

    response = table.scan(
        FilterExpression="userId = :user_id",
        ExpressionAttributeValues={":user_id": user_id}
    )

    if not response['Items']:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'No records found for userId', 'userId': user_id}),
            'headers': get_cors_headers()
        }

    # Filter to only include required fields
    filtered_policies = []
    for policy in response['Items']:
        filtered_policy = {
            'insuranceId': policy['insuranceId'],  
            'registrationNumber': policy.get('registrationNumber', ''),
            'make': policy.get('make', ''),
            'model': policy.get('model', ''),
            'insuranceType': policy.get('insuranceType', ''),
            'price': policy.get('price', 0),
            'expiryDate': policy.get('expiryDate', '')  
        }
        filtered_policies.append(filtered_policy)

    return {
        'statusCode': 200,
        'body': json.dumps(filtered_policies),
        'headers': get_cors_headers()
    }

def get_cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
