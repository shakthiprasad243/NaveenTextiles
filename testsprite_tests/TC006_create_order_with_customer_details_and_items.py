import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
TIMEOUT = 30

def test_create_order_with_customer_details_and_items():
    # First create a sample product to use in the order items
    product_payload = {
        "name": "Test Fabric",
        "base_price": 199.99,
        "main_category": "Fabrics",
        "category": "Cotton",
        "active": True,
        "variants": [
            {"size": "M", "color": "Blue"},
            {"size": "L", "color": "Red"}
        ]
    }
    product_id = None
    try:
        # Create product for order item reference
        prod_resp = requests.post(
            f"{BASE_URL}/products",
            json=product_payload,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert prod_resp.status_code == 200, f"Failed to create product: {prod_resp.text}"
        product_data = prod_resp.json()
        # Product ID is expected usually as id or _id or similar; assuming 'id'
        # But from the API doc we don't get explicit response schema for product creation 
        # so let's try "id" or "_id" or "product_id", fallback to keys present, else fail
        if "id" in product_data:
            product_id = product_data["id"]
        elif "_id" in product_data:
            product_id = product_data["_id"]
        elif "product_id" in product_data:
            product_id = product_data["product_id"]
        else:
            # If no id returned, fail
            assert False, "Product creation response missing product ID"

        # Now create an order using this product_id as reference in items
        order_payload = {
            "customer_name": "Test Customer",
            "customer_phone": "+919876543210",
            "customer_email": "testcustomer@example.com",
            "shipping_address": "123 Test Street, Bengaluru, India",
            "payment_method": "cash_on_delivery",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                    "variant": {"size": "M", "color": "Blue"}
                }
            ]
        }

        order_resp = requests.post(
            f"{BASE_URL}/orders",
            json=order_payload,
            auth=AUTH,
            timeout=TIMEOUT
        )

        assert order_resp.status_code == 200, f"Order creation failed: {order_resp.text}"
        order_resp_json = order_resp.json()

        # Validate required fields in the response
        assert "order_number" in order_resp_json, "order_number is missing in response"
        assert "order_id" in order_resp_json, "order_id is missing in response"
        # WhatsApp checkout URL should be somewhere; guessing field name: whatsapp_checkout_url or whatsapp_url
        # It's not explicitly mentioned in the PRD what the field name is, so try common possibilities
        whatsapp_url = None
        for key in ["whatsapp_checkout_url", "whatsapp_url", "checkout_url", "whatsapp_checkout"]:
            if key in order_resp_json:
                whatsapp_url = order_resp_json[key]
                break
        assert whatsapp_url is not None, "WhatsApp checkout URL missing from order creation response"
        # Basic validation of WhatsApp URL format
        assert whatsapp_url.startswith("https://wa.me/") or whatsapp_url.startswith("https://api.whatsapp.com/"), "WhatsApp URL format invalid"

    finally:
        # Clean up: delete the created product if product_id present
        if product_id:
            del_resp = requests.delete(f"{BASE_URL}/products/{product_id}", auth=AUTH, timeout=TIMEOUT)
            # Not asserting here because test has run, just best effort cleanup

test_create_order_with_customer_details_and_items()