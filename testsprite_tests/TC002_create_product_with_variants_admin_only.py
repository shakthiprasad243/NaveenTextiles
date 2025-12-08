import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_create_product_with_variants_admin_only():
    product_endpoint = f"{BASE_URL}/products"

    # Payload with required fields and optional variants
    valid_payload = {
        "name": "Premium Cotton Shirt",
        "slug": "premium-cotton-shirt",
        "description": "A comfortable premium cotton shirt available in multiple variants.",
        "base_price": 999.99,
        "main_category": "Apparel",
        "category": "Shirts",
        "active": True,
        "variants": [
            {"size": "M", "color": "Blue"},
            {"size": "L", "color": "White"}
        ]
    }

    # Payload missing required fields (name, base_price)
    invalid_payload = {
        "slug": "missing-required-fields",
        "description": "This product is missing required fields."
    }

    created_product_id = None

    try:
        # Test creating product with valid payload
        res = requests.post(
            product_endpoint,
            json=valid_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        json_res = res.json()
        assert isinstance(json_res, dict), "Response is not a JSON object"
        # Check at least 'id' or any identifier to track product for deletion later
        assert "id" in json_res or "product_id" in json_res, "Response missing product ID"
        created_product_id = json_res.get("id") or json_res.get("product_id")
        assert created_product_id, "Product ID in response is empty"

        # Test creating product with invalid payload (missing required fields)
        res_bad = requests.post(
            product_endpoint,
            json=invalid_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert res_bad.status_code == 400, f"Expected 400, got {res_bad.status_code}"

    finally:
        # Cleanup: delete created product if it exists
        if created_product_id:
            delete_url = f"{product_endpoint}/{created_product_id}"
            try:
                del_res = requests.delete(
                    delete_url,
                    headers=HEADERS,
                    auth=AUTH,
                    timeout=TIMEOUT,
                )
                assert del_res.status_code == 200, f"Deletion failed with status {del_res.status_code}"
            except Exception as e:
                print(f"Failed to delete product {created_product_id}: {e}")

test_create_product_with_variants_admin_only()