import json
import boto3

# Initialize DynamoDB resource
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("VehicleInsuranceData")  

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",  
        "Access-Control-Allow-Methods": "OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    # Handle preflight request (CORS)
    if event["httpMethod"] == "OPTIONS":
        return {"statusCode": 200, "headers": headers}

    if event["httpMethod"] != "DELETE":
        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        # Access query parameters from the URL
        user_id = event["queryStringParameters"].get("userId")
        insurance_id = event["queryStringParameters"].get("insuranceId")

        if not user_id or not insurance_id:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Missing userId or insuranceId"})
            }

        # Delete the policy from DynamoDB
        table.delete_item(
            Key={
                "userId": user_id,
                "insuranceId": insurance_id
            }
        )

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"message": "Policy cancelled successfully"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
