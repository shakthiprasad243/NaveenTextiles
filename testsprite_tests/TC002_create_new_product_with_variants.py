import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_create_new_product_with_variants():
    product_endpoint = f"{BASE_URL}/products"

    # Data with required fields + optional variants
    product_payload = {
        "name": "Test Product with Variants",
        "base_price": 199.99,
        "main_category": "Fabrics",
        "category": "Cotton",
        "active": True,
        "variants": [
            {"size": "M", "color": "Red"},
            {"size": "L", "color": "Blue"},
        ],
        "description": "A test product with multiple size and color variants",
        "slug": "test-product-variants"
    }

    # Payload missing a required field (base_price)
    product_payload_missing_required = {
        "name": "Invalid Product Missing base_price"
        # base_price missing intentionally
    }

    created_product_id = None

    try:
        # 1. Test creating a product successfully with variants
        response = requests.post(
            product_endpoint,
            json=product_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        product = response.json()
        # Validate minimum fields in response - assuming ID or similar returned
        assert isinstance(product, dict), "Response is not a dictionary"
        assert "name" in product and product["name"] == product_payload["name"], "Response product name mismatch"
        created_product_id = product.get("id") or product.get("_id") or product.get("product_id")
        # The API doc does not specify exact response, so check for at least some ID
        assert created_product_id is not None, "No product ID returned after creation"

        # 2. Test error response for missing required fields
        response_missing = requests.post(
            product_endpoint,
            json=product_payload_missing_required,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert response_missing.status_code == 400, f"Expected 400 for missing required fields, got {response_missing.status_code}"
        error_resp = response_missing.json()
        # Expect some error message or detail
        assert isinstance(error_resp, dict), "Error response is not a dictionary"
        assert any(("missing" in str(val).lower() or "required" in str(val).lower()) for val in error_resp.values()), "Error message does not indicate missing required fields"

    finally:
        # Cleanup: delete the created product if created
        if created_product_id:
            delete_endpoint = f"{product_endpoint}/{created_product_id}"
            try:
                del_response = requests.delete(
                    delete_endpoint,
                    headers=HEADERS,
                    auth=AUTH,
                    timeout=TIMEOUT,
                )
                # Allow 200 or possibly 204 for delete success
                assert del_response.status_code in (200, 204), f"Failed to delete product with id {created_product_id}"
            except Exception as e:
                print(f"Cleanup failed deleting product id {created_product_id}: {e}")


test_create_new_product_with_variants()