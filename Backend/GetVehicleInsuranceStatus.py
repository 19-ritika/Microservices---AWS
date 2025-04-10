import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VehicleInsuranceData')

def lambda_handler(event, context):
    # Extract registration number from the event (query parameter)
    registration_number = event.get('queryStringParameters', {}).get('registrationNumber')
    
    if not registration_number:
        return {
            'statusCode': 400,
            'body': '{"error": "registrationNumber is required"}'
        }
    
    try:
        # Scan the entire table for registrationNumber
        response = table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('registrationNumber').eq(registration_number)
        )

        # Check if the item exists in DynamoDB
        if 'Items' in response and len(response['Items']) > 0:
            # Item found, return "active" status with insurance details
            item = response['Items'][0]
            return {
                'statusCode': 200,
                'body': f'{{"status": "active", "insuranceType": "{item["insuranceType"]}", "expiryDate": "{item["expiryDate"]}"}}'
            }
        else:
            # Item not found, return "inactive" status
            return {
                'statusCode': 200,
                'body': '{"status": "inactive"}'
            }
    except ClientError as e:
        print(f"Error fetching item: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'body': '{"error": "An error occurred while fetching the data"}'
        }
