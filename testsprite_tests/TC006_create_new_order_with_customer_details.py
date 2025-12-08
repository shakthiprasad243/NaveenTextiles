import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_create_new_order_with_customer_details():
    product_id = None
    order_id = None
    try:
        # First, create a product to order since items are required to exist
        product_payload = {
            "name": "Test Product for Order",
            "base_price": 100.0,
            "active": True
        }
        product_resp = requests.post(
            f"{BASE_URL}/products",
            auth=AUTH,
            headers=HEADERS,
            json=product_payload,
            timeout=TIMEOUT,
        )
        assert product_resp.status_code == 200, f"Failed to create product: {product_resp.text}"
        product_data = product_resp.json()
        product_id = product_data.get("id") or product_data.get("product_id")
        assert product_id, "Product ID not returned in creation response"

        # SUCCESS CASE: Create new order with required fields and items
        order_payload = {
            "customer_name": "John Doe",
            "customer_phone": "9876543210",
            "customer_email": "john.doe@example.com",
            "shipping_address": "123, Textile Street, Mumbai, India",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2
                }
            ],
            "payment_method": "COD"
        }
        order_resp = requests.post(
            f"{BASE_URL}/orders",
            auth=AUTH,
            headers=HEADERS,
            json=order_payload,
            timeout=TIMEOUT,
        )
        assert order_resp.status_code == 200, f"Failed to create order: {order_resp.text}"
        order_data = order_resp.json()

        # Validate required response fields:
        assert "order_number" in order_data, "order_number missing in response"
        assert "order_id" in order_data, "order_id missing in response"
        assert "whatsapp_url" in order_data or any(
            key for key in order_data if "whatsapp" in key.lower()
        ), "WhatsApp checkout URL missing in response"

        order_id = order_data["order_id"]

        # ERROR CASES: Missing required fields
        required_fields = ["customer_name", "customer_phone", "items"]

        for field in required_fields:
            invalid_payload = order_payload.copy()
            invalid_payload.pop(field, None)

            err_resp = requests.post(
                f"{BASE_URL}/orders",
                auth=AUTH,
                headers=HEADERS,
                json=invalid_payload,
                timeout=TIMEOUT,
            )
            assert err_resp.status_code == 400, f"Expected 400 for missing {field}, got {err_resp.status_code}"
            err_json = err_resp.json()
            assert (
                "error" in err_json or "message" in err_json
            ), f"Error message missing for missing field {field}"

    finally:
        # Cleanup: Delete created order (if API allows)
        if order_id:
            # No delete order endpoint in PRD, skipping deletion of order
            pass

        # Cleanup: Delete created product
        if product_id:
            del_resp = requests.delete(
                f"{BASE_URL}/products/{product_id}",
                auth=AUTH,
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            assert del_resp.status_code == 200, f"Failed to delete product: {del_resp.text}"


test_create_new_order_with_customer_details()