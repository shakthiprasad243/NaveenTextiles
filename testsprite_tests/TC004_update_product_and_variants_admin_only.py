import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_update_product_and_variants_admin_only():
    # Step 1: Create a new product to update later
    create_payload = {
        "name": "Test Product TC004",
        "slug": "test-product-tc004",
        "description": "Initial description",
        "base_price": 99.99,
        "main_category": "Test Category",
        "category": "Test Subcategory",
        "active": True,
        "variants": [
            {"size": "M", "color": "Red", "stock": 10},
            {"size": "L", "color": "Blue", "stock": 5}
        ]
    }
    product_id = None

    try:
        create_resp = requests.post(
            f"{BASE_URL}/products",
            json=create_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Failed to create product: {create_resp.text}"
        created_product = create_resp.json()
        # The API shape for created product is not fully specified, but assume it returns at least 'id'.
        # Try keys: 'id' or '_id' or 'product_id'
        product_id = created_product.get("id") or created_product.get("_id") or created_product.get("product_id")
        assert product_id is not None, "Created product ID not found in response"

        # Step 2: Update product details and variants
        update_payload = {
            "name": "Updated Product TC004",
            "slug": "updated-product-tc004",
            "description": "Updated description",
            "base_price": 109.99,
            "main_category": "Updated Category",
            "category": "Updated Subcategory",
            "active": False,
            "variants": [
                {"size": "M", "color": "Red", "stock": 15},
                {"size": "XL", "color": "Green", "stock": 7}
            ]
        }
        update_resp = requests.patch(
            f"{BASE_URL}/products/{product_id}",
            json=update_payload,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Failed to update product: {update_resp.text}"
        updated_product_resp = update_resp.json()
        # Validate update response contains updated fields.
        # If response body does not return the product, fetch it again:
        get_resp = requests.get(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Failed to get updated product: {get_resp.text}"
        updated_product = get_resp.json()

        # Assert updated fields
        assert updated_product.get("name") == update_payload["name"], "Product name not updated correctly"
        assert updated_product.get("slug") == update_payload["slug"], "Product slug not updated correctly"
        assert updated_product.get("description") == update_payload["description"], "Product description not updated correctly"
        assert float(updated_product.get("base_price", 0)) == update_payload["base_price"], "Product base_price not updated correctly"
        assert updated_product.get("main_category") == update_payload["main_category"], "Product main_category not updated correctly"
        assert updated_product.get("category") == update_payload["category"], "Product category not updated correctly"
        assert updated_product.get("active") == update_payload["active"], "Product active status not updated correctly"

        # Assert variants updated - variants is array - check length and content subset
        variants_resp = updated_product.get("variants")
        assert isinstance(variants_resp, list), "Variants missing or not a list"
        # Check variant sizes/colors/stock equal updated payload (at least keys and values)
        def variant_key(v):
            # Create a tuple key to help comparison ignoring stock case sensitivity etc
            size = v.get("size") or v.get("Size") or ""
            color = v.get("color") or v.get("Color") or ""
            stock = v.get("stock") or v.get("Stock") or 0
            return (size.lower(), color.lower(), int(stock))
        expected_variants = [variant_key(v) for v in update_payload["variants"]]
        returned_variants = [variant_key(v) for v in variants_resp]
        assert sorted(expected_variants) == sorted(returned_variants), "Variants not updated correctly"

    finally:
        # Cleanup: delete the created product
        if product_id:
            delete_resp = requests.delete(
                f"{BASE_URL}/products/{product_id}",
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT
            )
            assert delete_resp.status_code == 200, f"Failed to delete product in cleanup: {delete_resp.text}"

test_update_product_and_variants_admin_only()