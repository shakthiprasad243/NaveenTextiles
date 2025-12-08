import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
TIMEOUT = 30

def test_get_product_by_id():
    # Create a product to test GET by ID with valid ID
    create_payload = {
        "name": "Test Product TC003",
        "base_price": 199.99,
        "slug": "test-product-tc003",
        "description": "Test product for test case TC003",
        "main_category": "Test Category",
        "category": "Test Subcategory",
        "active": True,
        "variants": []
    }
    headers = {"Content-Type": "application/json"}
    product_id = None

    try:
        # Create product (admin only)
        response_create = requests.post(
            f"{BASE_URL}/products",
            auth=AUTH,
            headers=headers,
            json=create_payload,
            timeout=TIMEOUT
        )
        assert response_create.status_code == 200, f"Product creation failed: {response_create.text}"
        created_product = response_create.json()
        product_id = created_product.get("id") or created_product.get("_id") or created_product.get("product_id")
        # If no id field returned, try to find a plausible id key from the response
        # If still None, error out
        assert product_id, f"Created product ID not found in response: {created_product}"

        # Test GET with valid product ID
        response_get_valid = requests.get(
            f"{BASE_URL}/products/{product_id}",
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response_get_valid.status_code == 200, f"GET product failed: {response_get_valid.text}"
        product_data = response_get_valid.json()
        assert product_data["name"] == create_payload["name"]
        assert float(product_data["base_price"]) == create_payload["base_price"]
        assert product_data.get("description", "") == create_payload["description"]

        # Test GET with non-existent product ID
        non_existent_id = "nonexistentid12345"
        response_get_invalid = requests.get(
            f"{BASE_URL}/products/{non_existent_id}",
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response_get_invalid.status_code == 404, f"Expected 404 for non-existent product ID but got {response_get_invalid.status_code}"

    finally:
        # Cleanup: delete created product if exists
        if product_id:
            requests.delete(
                f"{BASE_URL}/products/{product_id}",
                auth=AUTH,
                timeout=TIMEOUT
            )

test_get_product_by_id()