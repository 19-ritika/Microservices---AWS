import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TravelInsuranceData')

def lambda_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    print("Received event:", json.dumps(event))

    try:
        # Get the request parameters from query string
        query_params = event.get('queryStringParameters', {})
        user_id = query_params.get('userId')
        insurance_id = query_params.get('insuranceId')

        if not user_id or not insurance_id:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "userId and insuranceId are required"})
            }

        # Delete the policy from DynamoDB using the userId and insuranceId
        response = table.delete_item(
            Key={
                'userId': user_id,
                'insuranceId': insurance_id
            }
        )

        # Check if the deletion was successful
        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"message": "Policy deleted successfully"})
            }
        else:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": "Failed to delete policy"})
            }

    except ClientError as e:
        print(f"Error: {e.response['Error']['Message']}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "An error occurred while deleting the policy"})
        }
