import boto3
import json
from botocore.exceptions import ClientError
import logging

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TravelInsuranceData')

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    }

    # Log the incoming event
    logging.info(f"Received event: {json.dumps(event)}")

    try:
        # Parse query parameters
        user_id = event.get("queryStringParameters", {}).get("userId")
        
        if not user_id:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Missing required parameter: userId"})
            }

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('TravelInsuranceData')

        # Query DynamoDB for all policies related to userId
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )

        # Log the response for debugging
        logging.info(f"DynamoDB Response: {response}")

        if "Items" in response and response["Items"]:
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({
                    "status": "active",
                    "policies": response["Items"]
                })
            }
        else:
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"status": "inactive", "message": "No policies found for this userId."})
            }

    except ClientError as e:
        logging.error(f"Error: {e.response['Error']['Message']}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "An error occurred while retrieving policies.", "details": str(e)})
        }
