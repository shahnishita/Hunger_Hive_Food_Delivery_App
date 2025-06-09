import React, { useContext, useState, useEffect } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import { FaSearch } from 'react-icons/fa'

const Fooddisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterOption, setFilterOption] = useState('')
  const [sortOption, setSortOption] = useState('')
  const [filteredList, setFilteredList] = useState([])

  useEffect(() => {
    let filtered = food_list.filter(item => {
      // Case-insensitive and trimmed matching for category
      const categoryMatch =
        category === 'All' ||
        (item.category &&
          item.category.toLowerCase().trim() === category.toLowerCase().trim())

      const searchMatch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))

      return categoryMatch && searchMatch
    })

    // Apply filter dropdown
    if (filterOption === 'veg') {
      filtered = filtered.filter(item =>
        item.isVegetarian === true ||
        item.isVegetarian === 'Veg' ||
        item.isVegetarian === 'veg' ||
        (item.category && item.category.toLowerCase().includes('veg'))
      )
    } else if (filterOption === 'nonveg') {
      filtered = filtered.filter(item =>
        item.isVegetarian === false ||
        item.isVegetarian === 'NonVeg' ||
        item.isVegetarian === 'nonveg' ||
        (item.category &&
          (item.category.toLowerCase().includes('nonveg') ||
            item.category.toLowerCase().includes('non-vegetarian') ||
            item.category.toLowerCase().includes('non vegetarian')))
      )
    } else if (filterOption === 'popular') {
      filtered = filtered.filter(item =>
        item.isPopular === true || item.isPopular === 1
      )
    } else if (filterOption === 'priceUnder10') {
      filtered = filtered.filter(item => item.price < 10)
    } else if (filterOption === 'price10to20') {
      filtered = filtered.filter(item => item.price >= 10 && item.price <= 20)
    } else if (filterOption === 'priceOver20') {
      filtered = filtered.filter(item => item.price > 20)
    }

    // Apply sorting
    if (sortOption === 'priceLowHigh') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'priceHighLow') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortOption === 'nameAsc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOption === 'nameDesc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortOption === 'ratingHighLow') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortOption === 'popularity') {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    }

    setFilteredList(filtered)
  }, [category, searchTerm, filterOption, sortOption, food_list])

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h2 className="h2we">Explore Foods</h2>

        <div
          className="search-sort-container"
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          <div
            className="search-box"
            style={{ flexGrow: 1, minWidth: '200px', position: 'relative' }}
          >
            <FaSearch
              className="search-icon"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
              }}
            />
            <input
              type="text"
              placeholder="Search food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '30px', width: '100%' }}
            />
          </div>

          <select
            className="filter-dropdown"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">Filter by</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
            <option value="popular">Most Popular</option>
            <option value="priceUnder10">Price: Under ₹100</option>
            <option value="price10to20">Price: ₹101 - 200</option>
            <option value="priceOver20">Price: Over ₹200</option>
          </select>

          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">Sort by</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
            <option value="ratingHighLow">Rating: High to Low</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      <div className="food-display-list">
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  )
}

export default Fooddisplay
