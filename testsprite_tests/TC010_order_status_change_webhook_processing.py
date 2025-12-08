import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_order_status_change_webhook_processing():
    # Helper to create an order
    def create_order():
        order_payload = {
            "customer_name": "Test User",
            "customer_phone": "9998887777",
            "items": [
                {
                    # Minimal item structure; as API schema doesn't specify item details,
                    # assume at least product id and quantity is needed.
                    # Since product_id is unknown, create a product first to get product ID.
                    "product_id": None,
                    "quantity": 1
                }
            ]
        }
        # Create a product to use in order item
        product_payload = {
            "name": "WebhookTestProduct",
            "base_price": 100
        }
        prod_resp = requests.post(
            f"{BASE_URL}/products", json=product_payload, auth=AUTH, headers=HEADERS, timeout=TIMEOUT
        )
        prod_resp.raise_for_status()
        product = prod_resp.json()
        product_id = product.get("id") or product.get("product_id") or product.get("_id")
        assert product_id, "Product creation failed to return product ID"

        order_payload["items"][0]["product_id"] = product_id

        order_resp = requests.post(
            f"{BASE_URL}/orders", json=order_payload, headers=HEADERS, timeout=TIMEOUT
        )
        order_resp.raise_for_status()
        order_json = order_resp.json()
        order_id = order_json.get("order_id") or order_json.get("id")
        order_number = order_json.get("order_number")
        assert order_id and order_number, "Order creation did not return order_id or order_number"
        return order_id, order_number, product_id

    # Helper to delete product (cleanup)
    def delete_product(prod_id):
        try:
            resp = requests.delete(
                f"{BASE_URL}/products/{prod_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT
            )
            # Accept 200 or 404 (in case already deleted)
            assert resp.status_code in (200, 404)
        except Exception:
            pass

    # Helper to delete order - not in PRD, so ignore order deletion, assume no API

    order_id = None
    order_number = None
    product_id = None

    try:
        # Create order (and product internally)
        order_id, order_number, product_id = create_order()

        # 1) Valid webhook request with order_id and new_status
        webhook_payload = {
            "order_id": order_id,
            "new_status": "CONFIRMED",
            "old_status": "PENDING"
        }
        resp = requests.post(
            f"{BASE_URL}/webhooks/order-status",
            json=webhook_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        resp_json = resp.json()
        assert isinstance(resp_json, dict), "Response JSON should be a dict"

        # 2) Missing order_id
        payload_missing_order_id = {
            "new_status": "SHIPPED"
        }
        resp = requests.post(
            f"{BASE_URL}/webhooks/order-status",
            json=payload_missing_order_id,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400, f"Expected 400 for missing order_id, got {resp.status_code}"

        # 3) Missing new_status
        payload_missing_new_status = {
            "order_id": order_id
        }
        resp = requests.post(
            f"{BASE_URL}/webhooks/order-status",
            json=payload_missing_new_status,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400, f"Expected 400 for missing new_status, got {resp.status_code}"

        # 4) Non-existent order_id
        payload_nonexistent_order = {
            "order_id": "non-existent-order-id-12345",
            "new_status": "DELIVERED"
        }
        resp = requests.post(
            f"{BASE_URL}/webhooks/order-status",
            json=payload_nonexistent_order,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 404, f"Expected 404 for non-existent order, got {resp.status_code}"

    finally:
        # Cleanup product
        if product_id:
            delete_product(product_id)


test_order_status_change_webhook_processing()