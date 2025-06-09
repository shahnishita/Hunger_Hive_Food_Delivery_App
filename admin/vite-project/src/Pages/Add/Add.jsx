import React, { useState, useEffect } from 'react';
import './Add.css';
import { assets } from '../../assets/assets'; // Adjust path as needed
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
  const url = "http://localhost:4000"; // Replace with actual backend URL
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('category', data.category);

      const response = await axios.post(`${url}/api/food/add`, formData); // Adjust endpoint if needed

      if (response.data.success) {
        setData({
          name: '',
          description: '',
          price: '',
          category: 'Salad',
        });
        setImage(null);
        toast.success(response.data.message)
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        {/* Upload Image */}
        <div className='add-img-upload flex-col'>
          <p>Upload Image</p>
          <label htmlFor='image'>
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt='Upload Area'
            />
          </label>
          <input type='file' id='image' onChange={onImageChange} hidden required />
        </div>

        {/* Product Name */}
        <div className='add-product-name flex-col'>
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type='text'
            name='name'
            placeholder='Type here'
            required
          />
        </div>

        {/* Product Description */}
        <div className='add-product-description flex-col'>
          <p>Product Description</p>
          <textarea
            name='description'
            onChange={onChangeHandler}
            value={data.description}
            cols='30'
            rows='10'
            placeholder='Write content here'
            required
          />
        </div>

        {/* Category and Price */}
        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Product Category</p>
            <select onChange={onChangeHandler} name='category' value={data.category}>
              <option value='Salad'>Salad</option>
              <option value='Rolls'>Rolls</option>
              <option value='Desserts'>Desserts</option>
              <option value='Sandwich'>Sandwich</option>
              <option value='Cake'>Cake</option>
              <option value='Pure Veg'>Pure Veg</option>
              <option value='Pasta'>Pasta</option>
              <option value='Noodles'>Noodles</option>
            </select>
          </div>

          <div className='add-price flex-col'>
            <p>Product Price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type='number'
              name='price'
              placeholder='$20'
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type='submit' className='add'>
          Add
        </button>
      </form>
    </div>
  );
};

export default Add;
