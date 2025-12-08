import requests
from requests.auth import HTTPBasicAuth

base_url = "http://localhost:3000/api"
auth = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
timeout = 30

def test_get_product_by_id_valid_and_invalid():
    # First, create a new product to get a valid product ID
    product_data = {
        "name": "Test Product for TC003",
        "base_price": 100.0,
        "active": True
    }
    created_product_id = None
    try:
        create_resp = requests.post(f"{base_url}/products", json=product_data, auth=auth, timeout=timeout)
        assert create_resp.status_code == 200, f"Failed to create product, status code: {create_resp.status_code}"
        created_product = create_resp.json()
        created_product_id = created_product.get("id") or created_product.get("product_id") or created_product.get("ID")
        # If id is not present try common keys or fallback to None
        if not created_product_id:
            # Try keys if nested or different
            for key in created_product.keys():
                if 'id' in key.lower():
                    created_product_id = created_product[key]
                    break
        assert created_product_id, "Created product ID not found in response"

        # Test valid GET /products/{id}
        valid_get_resp = requests.get(f"{base_url}/products/{created_product_id}", auth=auth, timeout=timeout)
        assert valid_get_resp.status_code == 200, f"Expected 200 for valid product ID but got {valid_get_resp.status_code}"
        product_details = valid_get_resp.json()
        # Basic validation of returned product details
        assert isinstance(product_details, dict), "Product details should be a JSON object"
        assert product_details.get("name") == product_data["name"], "Returned product name mismatch"
        assert product_details.get("base_price") == product_data["base_price"], "Returned base_price mismatch"
        assert product_details.get("active") == product_data["active"], "Returned active status mismatch"

        # Test invalid GET /products/{id} with a made-up id
        invalid_id = "non-existent-id-1234567890"
        invalid_get_resp = requests.get(f"{base_url}/products/{invalid_id}", auth=auth, timeout=timeout)
        assert invalid_get_resp.status_code == 404, f"Expected 404 for non-existent product ID but got {invalid_get_resp.status_code}"

    finally:
        # Clean up: delete the created product if created_product_id is available
        if created_product_id:
            del_resp = requests.delete(f"{base_url}/products/{created_product_id}", auth=auth, timeout=timeout)
            # No assert on delete, but log if failure
            if del_resp.status_code != 200:
                print(f"WARNING: Cleanup delete product failed with status {del_resp.status_code}")

test_get_product_by_id_valid_and_invalid()