import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
TIMEOUT = 30


def test_get_products_with_filtering():
    headers = {
        "Accept": "application/json"
    }

    # 1. Test GET /api/products returns all products
    try:
        response_all = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH, timeout=TIMEOUT)
        response_all.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products failed: {e}"
    products_all = response_all.json()
    assert isinstance(products_all, list), "Expected list of products"
    assert len(products_all) >= 0, "Expected zero or more products"

    # If no products, create one to test filters
    new_product = None
    product_id = None
    if len(products_all) == 0:
        new_product_data = {
            "name": "FilterTestProduct",
            "base_price": 10.0,
            "main_category": "fabric",
            "category": "cotton",
            "active": True
        }
        try:
            create_resp = requests.post(f"{BASE_URL}/products", json=new_product_data, headers=headers, auth=AUTH, timeout=TIMEOUT)
            create_resp.raise_for_status()
            new_product = create_resp.json()
            product_id = new_product.get("id") or new_product.get("product_id")
            # Assuming API returns created product with id in response
            assert product_id is not None, "Created product ID not returned"
        except requests.RequestException as e:
            assert False, f"Setup failed to create product for filtering tests: {e}"

    # Prepare known filters from an existing or created product
    if new_product:
        main_category_val = new_product_data["main_category"]
        category_val = new_product_data["category"]
        active_val = "true" if new_product_data["active"] else "false"
    else:
        # Pick from first product of products_all if available, else skip filter tests
        first_product = products_all[0]
        main_category_val = first_product.get("main_category")
        category_val = first_product.get("category")
        active_val = "true" if first_product.get("active") else "false"

    # 2. Test filtering by main_category
    try:
        resp_main_cat = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH,
                                     params={"main_category": main_category_val}, timeout=TIMEOUT)
        resp_main_cat.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products with main_category filter failed: {e}"
    filtered_main_cat = resp_main_cat.json()
    assert isinstance(filtered_main_cat, list)
    assert all(p.get("main_category") == main_category_val for p in filtered_main_cat)

    # 3. Test filtering by category
    try:
        resp_cat = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH,
                                params={"category": category_val}, timeout=TIMEOUT)
        resp_cat.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products with category filter failed: {e}"
    filtered_cat = resp_cat.json()
    assert isinstance(filtered_cat, list)
    assert all(p.get("category") == category_val for p in filtered_cat)

    # 4. Test filtering by active status "true"
    try:
        resp_active_true = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH,
                                        params={"active": "true"}, timeout=TIMEOUT)
        resp_active_true.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products with active=true filter failed: {e}"
    filtered_active_true = resp_active_true.json()
    assert isinstance(filtered_active_true, list)
    assert all(p.get("active") is True for p in filtered_active_true)

    # 5. Test filtering by active status "false"
    try:
        resp_active_false = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH,
                                         params={"active": "false"}, timeout=TIMEOUT)
        resp_active_false.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products with active=false filter failed: {e}"
    filtered_active_false = resp_active_false.json()
    assert isinstance(filtered_active_false, list)
    assert all(p.get("active") is False for p in filtered_active_false)

    # 6. Test filtering by combined main_category, category and active
    filter_params = {
        "main_category": main_category_val,
        "category": category_val,
        "active": active_val
    }
    try:
        resp_combined = requests.get(f"{BASE_URL}/products", headers=headers, auth=AUTH,
                                     params=filter_params, timeout=TIMEOUT)
        resp_combined.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/products with combined filters failed: {e}"
    filtered_combined = resp_combined.json()
    assert isinstance(filtered_combined, list)
    for p in filtered_combined:
        assert p.get("main_category") == main_category_val
        assert p.get("category") == category_val
        expected_active = True if active_val == "true" else False
        assert p.get("active") is expected_active

    # Cleanup created product if any
    if product_id:
        try:
            del_resp = requests.delete(f"{BASE_URL}/products/{product_id}",
                                      headers=headers, auth=AUTH, timeout=TIMEOUT)
            del_resp.raise_for_status()
        except requests.RequestException as e:
            # Not failing the test for cleanup, but log or raise if needed
            pass


test_get_products_with_filtering()