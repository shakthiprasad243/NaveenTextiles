import requests

BASE_URL = "http://localhost:3000/api"
BEARER_TOKEN = "admin_token_here"  # Replace with valid admin bearer token
TIMEOUT = 30

def test_cleanup_expired_reservations_cron_job():
    url = f"{BASE_URL}/cron/cleanup-reservations"
    headers = {"Accept": "application/json", "Authorization": f"Bearer {BEARER_TOKEN}"}

    # Test unauthorized access (without auth)
    try:
        response_unauth = requests.post(url, timeout=TIMEOUT)
        assert response_unauth.status_code == 401, f"Expected 401 Unauthorized, got {response_unauth.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException on unauthorized test: {str(e)}"

    # Test authorized POST request to trigger cleanup
    try:
        response = requests.post(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        # Optionally check response content if any detail is returned
        try:
            json_data = response.json()
            # accept any non-empty JSON object/dict as success confirmation
            assert isinstance(json_data, (dict, list)), "Response JSON is not a dict or list"
        except ValueError:
            # If response is not JSON but 200 OK, still considered success per PRD
            pass
    except requests.RequestException as e:
        assert False, f"RequestException on authorized request: {str(e)}"

    # Test error handling: simulate bad token by sending wrong auth
    headers_wrong = {"Accept": "application/json", "Authorization": "Bearer wrongtoken"}
    try:
        response_invalid_auth = requests.post(url, headers=headers_wrong, timeout=TIMEOUT)
        assert response_invalid_auth.status_code == 401, \
            f"Expected 401 Unauthorized, got {response_invalid_auth.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException on invalid auth test: {str(e)}"

test_cleanup_expired_reservations_cron_job()
