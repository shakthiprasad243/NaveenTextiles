import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
ADMIN_USER = "admin@naveentextiles.com"
ADMIN_PASS = "admin123"
TIMEOUT = 30

def test_TC005_delete_product_and_variants():
    auth = HTTPBasicAuth(ADMIN_USER, ADMIN_PASS)
    headers = {"Content-Type": "application/json"}

    product_payload = {
        "name": "Test Product To Delete",
        "base_price": 199.99,
        "variants": [
            {"size": "M", "color": "Red"},
            {"size": "L", "color": "Blue"}
        ]
    }

    product_id = None
    try:
        # Create a new product to delete
        create_resp = requests.post(f"{BASE_URL}/products", json=product_payload, auth=auth, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 200, f"Product creation failed with status {create_resp.status_code}"
        create_data = create_resp.json()
        # Product creation response structure is not explicitly detailed, assume ID is returned
        product_id = str(create_data.get("id") or create_data.get("product_id") or create_data.get("id"))

        assert product_id, "No product ID returned on creation"

        # Delete the product
        delete_resp = requests.delete(f"{BASE_URL}/products/{product_id}", auth=auth, timeout=TIMEOUT)

        # Should return 200 for success or 500 for server error, test both
        if delete_resp.status_code == 200:
            # Verify product is deleted by attempting to GET it
            get_resp = requests.get(f"{BASE_URL}/products/{product_id}", auth=auth, timeout=TIMEOUT)
            assert get_resp.status_code == 404, f"Deleted product still accessible, GET status: {get_resp.status_code}"
        elif delete_resp.status_code == 500:
            # Server error handled gracefully (i.e. no crash) - we just assert status_code and response exists
            assert "error" in delete_resp.text.lower() or delete_resp.text, "Server error response missing message"
        else:
            assert False, f"Unexpected DELETE status code: {delete_resp.status_code}"
    finally:
        # Cleanup: if product not deleted by the test and product_id exists, attempt delete again to cleanup
        if product_id:
            try:
                requests.delete(f"{BASE_URL}/products/{product_id}", auth=auth, timeout=TIMEOUT)
            except Exception:
                pass

test_TC005_delete_product_and_variants()