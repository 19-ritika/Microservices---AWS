import json
import os
import boto3
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Initialize AWS clients
cognito_client = boto3.client("cognito-idp")

# Get environment variables
USER_POOL_ID = os.getenv("USER_POOL_ID")
CLIENT_ID = os.getenv("CLIENT_ID")

# Function to validate required parameters
def validate_params(event, required_fields):
    for field in required_fields:
        if field not in event or not event[field]:
            return {"statusCode": 400, "body": json.dumps({"error": f"Missing required parameter: {field}"})}
    return None

# Function to fetch username from email
def get_username_by_email(email):
    try:
        response = cognito_client.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'email = "{email}"'
        )
        if response["Users"]:
            return response["Users"][0]["Username"]
        else:
            return None  # User not found
    except ClientError as e:
        logger.error(f"Error fetching username by email: {e}")
        return None

# Function to send forgot password OTP
def forgot_password(event):
    validation_error = validate_params(event, ["email"])
    if validation_error:
        return validation_error

    email = event["email"]
    username = get_username_by_email(email)
    if not username:
        return {"statusCode": 400, "body": json.dumps({"error": "User not found."})}

    try:
        cognito_client.forgot_password(ClientId=CLIENT_ID, Username=username)
        return {"statusCode": 200, "body": json.dumps({"message": "Password reset instructions sent."})}
    
    except cognito_client.exceptions.UserNotFoundException:
        return {"statusCode": 400, "body": json.dumps({"error": "User not found."})}
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

# Function to reset password with OTP verification
def reset_password(event):
    validation_error = validate_params(event, ["email", "otp", "new_password"])
    if validation_error:
        return validation_error

    email = event["email"]
    otp = event["otp"]
    new_password = event["new_password"]
    username = get_username_by_email(email)

    if not username:
        return {"statusCode": 400, "body": json.dumps({"error": "User not found."})}

    try:
        cognito_client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=username,
            ConfirmationCode=otp,
            Password=new_password,
        )
        return {"statusCode": 200, "body": json.dumps({"message": "Password reset successfully."})}

    except cognito_client.exceptions.CodeMismatchException:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid OTP code."})}
    except cognito_client.exceptions.ExpiredCodeException:
        return {"statusCode": 400, "body": json.dumps({"error": "OTP code has expired."})}
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


# Function to register user
def register_user(event):
    validation_error = validate_params(event, ["username", "password", "email"])
    if validation_error:
        return validation_error

    try:
        response = cognito_client.sign_up(
            ClientId=CLIENT_ID,
            Username=event["username"],
            Password=event["password"],
            UserAttributes=[{"Name": "email", "Value": event["email"]}],
        )

        # Confirm user & verify email automatically (optional)
        cognito_client.admin_confirm_sign_up(UserPoolId=USER_POOL_ID, Username=event["username"])
        cognito_client.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=event["username"],
            UserAttributes=[{"Name": "email_verified", "Value": "true"}],
        )

        return {"statusCode": 200, "body": json.dumps({"message": "User registration successful"})}

    except cognito_client.exceptions.UsernameExistsException:
        return {"statusCode": 400, "body": json.dumps({"error": "User already exists."})}
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

# Function to log in user
def login_user(event):
    validation_error = validate_params(event, ["username", "password"])
    if validation_error:
        return validation_error

    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": event["username"], "PASSWORD": event["password"]},
        )
        return {"statusCode": 200, "body": json.dumps(response["AuthenticationResult"])}

    except cognito_client.exceptions.NotAuthorizedException:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid credentials."})}
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

# Function to validate token
def validate_token(event):
    validation_error = validate_params(event, ["access_token"])
    if validation_error:
        return validation_error

    try:
        response = cognito_client.get_user(AccessToken=event["access_token"])
        return {"statusCode": 200, "body": json.dumps(response)}

    except cognito_client.exceptions.NotAuthorizedException:
        return {"statusCode": 401, "body": json.dumps({"error": "Invalid token."})}
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

# Main Lambda handler
def lambda_handler(event, context):
    logger.info(f"Received Event: {json.dumps(event)}")

    # Extract body from API Gateway request
    try:
        body = json.loads(event["body"]) if "body" in event else event
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}

    action = body.get("action")

    action_map = {
        "register": register_user,
        "login": login_user,
        "forgot_password": forgot_password,
        "reset_password": reset_password,
        "validate": validate_token,
    }

    if action in action_map:
        return action_map[action](body)
    else:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid action."})}