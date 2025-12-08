import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_TC008_update_order_status_with_inventory_handling():
    order_id = None
    try:
        # Step 1: Create a new order to test status update on it
        order_payload = {
            "customer_name": "Test User",
            "customer_phone": "9999999999",
            "items": [
                # sample item - minimal structure since schema of items not fully detailed in PRD
                {
                    "product_id": "sample-product-id",
                    "quantity": 1
                }
            ]
        }
        create_order_resp = requests.post(
            f"{BASE_URL}/orders",
            json=order_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        # Assert create order successful
        assert create_order_resp.status_code == 200, f"Failed to create order: {create_order_resp.text}"
        create_order_data = create_order_resp.json()
        assert "order_id" in create_order_data, "order_id not returned in order creation"
        order_id = create_order_data["order_id"]

        # Step 2: Valid status update to CONFIRMED
        status_update_payload = {"status": "CONFIRMED"}
        patch_resp = requests.patch(
            f"{BASE_URL}/orders/{order_id}/status",
            json=status_update_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert patch_resp.status_code == 200, f"Failed to update status to CONFIRMED: {patch_resp.text}"

        # Step 3: Update status to CANCELLED to trigger inventory release handling
        cancel_payload = {"status": "CANCELLED"}
        cancel_resp = requests.patch(
            f"{BASE_URL}/orders/{order_id}/status",
            json=cancel_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert cancel_resp.status_code == 200, f"Failed to update status to CANCELLED: {cancel_resp.text}"

        # Step 4: Attempt invalid status update and expect 400 error
        invalid_status_payload = {"status": "INVALID_STATUS"}
        invalid_resp = requests.patch(
            f"{BASE_URL}/orders/{order_id}/status",
            json=invalid_status_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert invalid_resp.status_code == 400, f"Expected 400 for invalid status but got {invalid_resp.status_code}"

        # For server error simulation - not possible without control on server
        # So, we skip direct server error test here
    finally:
        # Cleanup: Delete the created order if possible
        if order_id:
            # Assuming delete order endpoint exists: DELETE /api/orders/{id}
            # Not specified in PRD, so if not available, ignore cleanup
            try:
                requests.delete(
                    f"{BASE_URL}/orders/{order_id}",
                    auth=AUTH,
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_TC008_update_order_status_with_inventory_handling()