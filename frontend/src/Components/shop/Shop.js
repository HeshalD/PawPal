import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Cart from "../cart/Cart";
import { useCart } from "../../Contexts/CartContext";

const URL = "http://localhost:5000/items";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Shop() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name"); // name, price-asc, price-desc, category
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  // ✅ Added missing state
  const [selectedItem, setSelectedItem] = useState(null);

  const { addToCart, getTotalItems, isInCart } = useCart();

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await fetchHandler();
        setItems(data.items || []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const mapToGroup = (rawCategory) => {
    const c = (rawCategory || "").toString().toLowerCase();
    if (/(food|treat|diet|kibble|can|wet|dry)/.test(c)) return "Pet Food";
    if (/(med|medicine|drug|antibiotic|supplement|vitamin|vet)/.test(c))
      return "Medicine";
    if (
      /(accessor|toy|leash|collar|bed|bowl|groom|brush|litter|carrier)/.test(c)
    )
      return "Accessories";
    return "Other";
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      // Search filter
      const searchMatch =
        !searchQuery ||
        [item.Item_Name, item.Category, item.Description].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Category filter
      const categoryMatch =
        categoryFilter === "All" || mapToGroup(item.Category) === categoryFilter;

      return searchMatch && categoryMatch;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.Price || 0) - (b.Price || 0);
        case "price-desc":
          return (b.Price || 0) - (a.Price || 0);
        case "category":
          return mapToGroup(a.Category).localeCompare(mapToGroup(b.Category));
        case "name":
        default:
          return (a.Item_Name || "").localeCompare(b.Item_Name || "");
      }
    });

    return filtered;
  }, [items, searchQuery, categoryFilter, sortBy]);

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (quantity < 10)
      return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  if (loading) {
    return (
      <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6638E6] mx-auto mb-4"></div>
              <p className="text-[#64706f]">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#333333] mb-2">Pet Shop</h1>
            <p className="text-[#64706f]">
              Discover amazing products for your furry friends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#64706f] hidden sm:block">
              Showing {filteredAndSortedItems.length} products
            </p>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white border border-[#E6F4F3] text-[#333333] font-medium px-4 py-2 rounded-md shadow-sm hover:bg-[#E69AAE] transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                <span>Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#6638E6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E6F4F3] p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#9aa7a6] absolute left-3 top-1/2 transform -translate-y-1/2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E6F4F3] rounded-lg focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-[#E6F4F3] rounded-lg focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Pet Food">Pet Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-[#E6F4F3] rounded-lg focus:ring-2 focus:ring-[#6638E6] focus:border-transparent outline-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-[#333333] mb-2">
              No products found
            </h3>
            <p className="text-[#64706f]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => {
              const stockStatus = getStockStatus(item.Quantity);
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-[#E6F4F3] overflow-hidden hover:shadow-md transition-shadow duration-200"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.Item_Name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center text-4xl text-gray-400 ${
                        item.image ? "hidden" : "flex"
                      }`}
                    >
                      🐾
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                      >
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-[#6638E6] bg-[#E69AAE] px-2 py-1 rounded-full">
                        {mapToGroup(item.Category)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-[#333333] mb-2 line-clamp-2">
                      {item.Item_Name}
                    </h3>

                    {item.Description && (
                      <p className="text-sm text-[#64706f] mb-3 line-clamp-2">
                        {item.Description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-[#6638E6]">
                          Rs.{" "}
                          {item.Price
                            ? parseFloat(item.Price).toFixed(2)
                            : "0.00"}
                        </span>
                        {item.Unit_of_Measure && (
                          <span className="text-sm text-[#64706f] ml-1">
                            / {item.Unit_of_Measure}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#64706f] mb-4">
                      <span>Stock: {item.Quantity || 0}</span>
                      <span>ID: {item._id?.slice(-6) || "N/A"}</span>
                    </div>

                    <button
                      disabled={item.Quantity === 0}
                      onClick={() => addToCart(item)}
                      className={`w-full text-center font-semibold px-4 py-2 rounded-md shadow-sm transition-colors ${
                        item.Quantity === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : isInCart(item._id)
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white"
                      }`}
                    >
                      {item.Quantity === 0
                        ? "Out of Stock"
                        : isInCart(item._id)
                        ? "✓ In Cart"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}

export default Shop;
