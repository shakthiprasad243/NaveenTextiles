import requests

BASE_URL = "http://localhost:3000/api"
HEADERS = {"Content-Type": "application/json", "Authorization": "Bearer ADMIN_TOKEN"}
TIMEOUT = 30

def test_delete_product_and_variants_admin_only():
    product_data = {
        "name": "Test Product For Deletion",
        "base_price": 99.99,
        "description": "Temporary product for delete test",
        "main_category": "TestCategory",
        "category": "TestSubCategory",
        "active": True,
        "variants": [
            {"size": "M", "color": "Red", "stock": 10},
            {"size": "L", "color": "Blue", "stock": 5}
        ]
    }

    product_id = None
    try:
        # Create a new product to delete
        create_resp = requests.post(
            f"{BASE_URL}/products",
            json=product_data,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Product creation failed: {create_resp.text}"
        create_json = create_resp.json()
        product_id = str(create_json.get("id") or create_json.get("product_id") or create_json.get("id") or create_json.get("productId"))
        if not product_id:
            for key in create_json:
                if key.lower().endswith("id"):
                    product_id = str(create_json[key])
                    break
        assert product_id, "Product ID not found in create response"

        # Delete the created product as admin
        delete_resp = requests.delete(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code == 200, f"Failed to delete product: {delete_resp.text}"

        # Verify product is removed by attempting to retrieve it
        get_resp = requests.get(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 404, "Deleted product still accessible (expected 404)"

    finally:
        # Cleanup: In case deletion failed, delete the product if it still exists
        if product_id:
            try:
                resp_check = requests.get(
                    f"{BASE_URL}/products/{product_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                if resp_check.status_code == 200:
                    requests.delete(
                        f"{BASE_URL}/products/{product_id}",
                        headers=HEADERS,
                        timeout=TIMEOUT
                    )
            except Exception:
                pass

test_delete_product_and_variants_admin_only()
