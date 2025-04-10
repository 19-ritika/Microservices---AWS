import json
import boto3
import uuid
import datetime
from botocore.exceptions import ClientError

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TravelInsuranceData')

def lambda_handler(event, context):
    try:
        # Parse the incoming event
        body = json.loads(event.get('body', '{}')) 
        
        
        user_id = body.get('userId')
        username = body.get('username')
        trip_title = body.get('tripTitle')
        insurance_type = body.get('insuranceType', 'Short Term')
        price = body.get('price', 100)
        start_date = body.get('startDate', 'Not available')
        end_date = body.get('endDate', 'Not available')
        
        if not user_id or not username or not trip_title:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing required fields'})
            }

        # Generate a unique insurance ID
        insurance_id = str(uuid.uuid4())

        # Store timestamp for record creation
        created_at = str(datetime.datetime.utcnow())

        # Create the item to be stored in DynamoDB
        item = {
            'userId': user_id,
            'insuranceId': insurance_id,
            'customer_name': username,
            'title': trip_title,
            'insuranceType': insurance_type,
            'price': price,
            'startDate': start_date,
            'endDate': end_date,
            'createdAt': created_at
        }

        # Put the item into the DynamoDB table
        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
            },
            'body': json.dumps({'message': 'Travel insurance data saved successfully!'})
        }

    except ClientError as e:
        print(f"Error saving data to DynamoDB: {str(e)}")  # Log error for debugging
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
            },
            'body': json.dumps({'message': 'Failed to save travel insurance data', 'error': str(e)})
        }
