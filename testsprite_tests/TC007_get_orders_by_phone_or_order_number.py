import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_get_orders_by_phone_or_order_number():
    # Create a new order to obtain phone and order_number values
    create_order_payload = {
        "customer_name": "Test User",
        "customer_phone": "9998887776",
        "customer_email": "testuser@example.com",
        "shipping_address": "123 Test Street, Test City",
        "items": [{"product_id": "dummy", "quantity": 1}],
        "payment_method": "COD"
    }

    order_id = None
    order_number = None
    customer_phone = create_order_payload["customer_phone"]

    try:
        # Create order
        create_resp = requests.post(
            f"{BASE_URL}/orders",
            json=create_order_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Order creation failed: {create_resp.text}"
        create_data = create_resp.json()
        assert "order_number" in create_data, "order_number missing in create order response"
        assert "order_id" in create_data, "order_id missing in create order response"

        order_id = create_data["order_id"]
        order_number = create_data["order_number"]

        # 1. GET orders filtered by phone number
        params_phone = {"phone": customer_phone}
        resp_phone = requests.get(
            f"{BASE_URL}/orders",
            params=params_phone,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_phone.status_code == 200, f"Failed to get orders by phone: {resp_phone.text}"
        orders_phone = resp_phone.json()
        assert isinstance(orders_phone, (list, dict)), "Response should be list or dict"
        # At least one order should match phone number
        found_phone = False
        if isinstance(orders_phone, list):
            for order in orders_phone:
                if "customer_phone" in order and order["customer_phone"] == customer_phone:
                    found_phone = True
                    break
        elif isinstance(orders_phone, dict):
            found_phone = orders_phone.get("customer_phone") == customer_phone
        assert found_phone, "No orders found matching the customer phone"

        # 2. GET orders filtered by order number
        params_order_number = {"order_number": order_number}
        resp_order_number = requests.get(
            f"{BASE_URL}/orders",
            params=params_order_number,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_order_number.status_code == 200, f"Failed to get orders by order_number: {resp_order_number.text}"
        orders_number = resp_order_number.json()
        assert isinstance(orders_number, (list, dict)), "Response should be list or dict"
        found_order_number = False
        if isinstance(orders_number, list):
            for order in orders_number:
                if "order_number" in order and order["order_number"] == order_number:
                    found_order_number = True
                    break
        elif isinstance(orders_number, dict):
            found_order_number = orders_number.get("order_number") == order_number
        assert found_order_number, "No orders found matching the order_number"

        # 3. GET orders with neither phone nor order_number - should return 400 error
        resp_no_params = requests.get(
            f"{BASE_URL}/orders",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_no_params.status_code == 400, f"Expected 400 when no parameters provided, got {resp_no_params.status_code}"

    finally:
        if order_id:
            # Clean up by deleting the created order if API supports deletion - 
            # Since API for delete order is not defined in PRD, skipping deletion.
            pass

test_get_orders_by_phone_or_order_number()