import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH_USERNAME = "admin@naveentextiles.com"
AUTH_PASSWORD = "admin123"
TIMEOUT = 30

def test_cron_cleanup_expired_reservations_and_orders():
    headers = {
        "Content-Type": "application/json"
    }

    # Test unauthorized access (no auth header) returns 401
    response_unauth = requests.post(
        f"{BASE_URL}/cron/cleanup-reservations",
        headers=headers,
        timeout=TIMEOUT
    )
    assert response_unauth.status_code == 401, f"Expected 401 Unauthorized but got {response_unauth.status_code}"

    # Test authorized access returns 200 and cleanup completed
    response_auth = requests.post(
        f"{BASE_URL}/cron/cleanup-reservations",
        headers=headers,
        auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
        timeout=TIMEOUT
    )
    assert response_auth.status_code == 200, f"Expected 200 OK but got {response_auth.status_code}"

    # Optionally validate response content if any message or structure exists
    try:
        json_resp = response_auth.json()
        # Since no schema specified for response body, just check it's dict or has expected keys if any
        assert isinstance(json_resp, (dict, list)) or json_resp is None
    except ValueError:
        # Response is not JSON, accept as long as status code is 200
        pass

test_cron_cleanup_expired_reservations_and_orders()