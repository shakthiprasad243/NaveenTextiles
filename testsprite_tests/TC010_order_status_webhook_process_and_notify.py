import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
TIMEOUT = 30

def test_order_status_webhook_process_and_notify():
    order_create_url = f"{BASE_URL}/orders"
    webhook_url = f"{BASE_URL}/webhooks/order-status"
    headers = {"Content-Type": "application/json"}

    order_payload = {
        "customer_name": "Test User",
        "customer_phone": "9999999999",
        "items": [
            {
                "product_id": "test-product-id",
                "quantity": 1
            }
        ]
    }

    # Create a test order
    try:
        resp_create = requests.post(order_create_url, json=order_payload, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_create.status_code == 200, f"Order creation failed with status {resp_create.status_code}"
        data_create = resp_create.json()
        assert "order_id" in data_create and "order_number" in data_create, "Order response missing order_id or order_number"
        order_id = data_create["order_id"]

        # Valid webhook call - status update
        webhook_payload_valid = {
            "order_id": order_id,
            "new_status": "CONFIRMED",
            "old_status": "PENDING"
        }
        resp_webhook_valid = requests.post(webhook_url, json=webhook_payload_valid, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_webhook_valid.status_code == 200, f"Valid webhook failed with status {resp_webhook_valid.status_code}"

        # Webhook call missing order_id (should return 400)
        webhook_payload_no_order_id = {
            "new_status": "SHIPPED"
        }
        resp_webhook_no_order_id = requests.post(webhook_url, json=webhook_payload_no_order_id, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_webhook_no_order_id.status_code == 400

        # Webhook call missing new_status (should return 400)
        webhook_payload_no_new_status = {
            "order_id": order_id
        }
        resp_webhook_no_new_status = requests.post(webhook_url, json=webhook_payload_no_new_status, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_webhook_no_new_status.status_code == 400

        # Webhook call invalid order_id (should return 404)
        webhook_payload_invalid_order = {
            "order_id": "non-existent-id-123",
            "new_status": "DELIVERED"
        }
        resp_webhook_invalid_order = requests.post(webhook_url, json=webhook_payload_invalid_order, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_webhook_invalid_order.status_code == 404

        # Webhook call with invalid new_status (not in enum) - expect 400 or 500 depending on API behavior
        webhook_payload_invalid_status = {
            "order_id": order_id,
            "new_status": "INVALID_STATUS"
        }
        resp_webhook_invalid_status = requests.post(webhook_url, json=webhook_payload_invalid_status, auth=AUTH, timeout=TIMEOUT, headers=headers)
        assert resp_webhook_invalid_status.status_code in (400, 500)

    finally:
        # Cleanup: Delete the created order if API supports deletion (not described in PRD)
        # If no delete endpoint, skip cleanup
        pass

test_order_status_webhook_process_and_notify()