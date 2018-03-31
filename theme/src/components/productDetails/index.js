import React from 'react'
import { NavLink } from 'react-router-dom'
import * as helper from '../../lib/helper'
import { themeSettings, text } from '../../lib/settings'
import ViewedProducts from '../products/viewed'

import Breadcrumbs from './breadcrumbs'
import DiscountCountdown from './discountCountdown'
import AddToCartButton from './addToCartButton'
import Attributes from './attributes'
import Gallery from './gallery'
import Options from './options'
import Price from './price'
import Quantity from './quantity'
import RelatedProducts from './relatedProducts'
import Tags from './tags'

const Fragment = React.Fragment;

const Description = ({ description }) => (
  <div className="product-content" dangerouslySetInnerHTML={{__html: description}}/>
)

export default class ProductDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOptions: {},
      selectedVariant: null,
      isAllOptionsSelected: false,
      quantity: 1
    }

    this.onOptionChange = this.onOptionChange.bind(this);
    this.findVariantBySelectedOptions = this.findVariantBySelectedOptions.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.checkSelectedOptions = this.checkSelectedOptions.bind(this);
  }

  onOptionChange(optionId, valueId) {
    let {selectedOptions} = this.state;

    if(valueId === '') {
      delete selectedOptions[optionId];
    } else {
      selectedOptions[optionId] = valueId;
    }

    this.setState({ selectedOptions: selectedOptions });
    this.findVariantBySelectedOptions();
    this.checkSelectedOptions();
  }

  findVariantBySelectedOptions() {
    const {selectedOptions} = this.state;
    const {product} = this.props;
    for(const variant of product.variants) {
      const variantMutchSelectedOptions = variant.options.every(variantOption => selectedOptions[variantOption.option_id] === variantOption.value_id);
      if(variantMutchSelectedOptions) {
        this.setState({ selectedVariant: variant });
        return;
      }
    }

    this.setState({ selectedVariant: null });
  }

  setQuantity = (quantity) => {
    this.setState({ quantity: quantity });
  }

  addToCart() {
    const {product, addCartItem} = this.props;
    const {selectedVariant, quantity} = this.state;

    let item = {
      product_id: product.id,
      quantity: quantity
    }

    if(selectedVariant) {
      item.variant_id = selectedVariant.id;
    }

    addCartItem(item);
  }

  checkSelectedOptions() {
    const {selectedOptions} = this.state;
    const {product} = this.props;

    const allOptionsSelected = Object.keys(selectedOptions).length === product.options.length;
    this.setState({ isAllOptionsSelected: allOptionsSelected });
  }

  render() {
    const {product, settings, categories} = this.props;

    let rating;
    let comments;
    let rate = 0;
    if(product.rating){
      rating = JSON.parse(product.rating);
      Object.keys(rating).forEach(function(key) {
        rate += rating[key];
      });
      rate = rate / Object.keys(rating).length;
      rate = Math.round(rate);
    }

    const compatibilityWidget = function() {
      if(product.compatibility){
        let products = product.compatibility.split(',');
        let compatible = products.map((key, i) => {
          if(i === 0) return([<span>Compatible Products : </span> ,getCompatible(key)]);
          return([<span> - </span>, getCompatible(key)]);
        });
        return(compatible);
      }
    }

    const commentaries = function() {
      if(product.comments){
        comments = JSON.parse(product.comments);
        if(Object.keys(comments).length < 1) {
          return(<p>No review for this product</p>)
        }else{
          let comms = Object.keys(comments).map((key, i) => {
            if(i === 0) return([<h4 style={titleComStyle}>Reviews :</h4>, <br></br> ,getCom(key, comments)]);
            return(getCom(key, comments));
          });
          return(comms);
        }
      }else{
        return(<p>No review for this product</p>);
      }
    };

    const titleComStyle = {
      marginTop: '18px',
    }

    const comStyle = {
      padding: '10px',
      backgroundColor: 'beige',
      borderRadius: '10px',
      margin: '10px',
    };

    const getCom = function(key, comments) {
      return(<div style={comStyle} key={key}><p>{key} : {comments[key]}</p></div>);
    };

    const getCompatible = function(key) {
      let url = `/${key}`; 
      return(<a href={url} target="_blank"> {key.toUpperCase()} </a>);
    };

    const {selectedVariant, isAllOptionsSelected} = this.state;
    const maxQuantity = product.stock_status === 'discontinued' ?
      0 :
      product.stock_backorder ?
        themeSettings.maxCartItemQty :
        (selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity);

    if(product){
      return (
        <Fragment>
          <section className="section section-product">
            <div className="container">
              <div className="columns">
                <div className="column is-7">
                  {themeSettings.show_product_breadcrumbs &&
                    <Breadcrumbs product={product} categories={categories} />
                  }
                  <Gallery images={product.images} />
                </div>
                <div className="column is-5">
                  <div className="content">
                    <Tags tags={product.tags} />
                    <h1 className="title is-4 product-name">{product.name}</h1>
                    <h1 className="title is-4 product-name">{product.brand}</h1>
                    <Price product={product} variant={selectedVariant} isAllOptionsSelected={isAllOptionsSelected} settings={settings} />

                    <div className="wrapper2">
                      <input type="checkbox" id="st5" value="5" readOnly checked={rate===5}/>
                      <label htmlFor="st5"></label>
                      <input type="checkbox" id="st4" value="4" readOnly checked={rate===4}/>
                      <label htmlFor="st4"></label>
                      <input type="checkbox" id="st3" value="3" readOnly checked={rate===3}/>
                      <label htmlFor="st3"></label>
                      <input type="checkbox" id="st2" value="2" readOnly checked={rate===2}/>
                      <label htmlFor="st2"></label>
                      <input type="checkbox" id="st1" value="1" readOnly checked={rate===1}/>
                      <label htmlFor="st1"></label>
                    </div>

                    {themeSettings.show_discount_countdown && product.on_sale === true &&
                      <DiscountCountdown product={product} />
                    }

                    <Options options={product.options} onChange={this.onOptionChange} />
                    <Quantity maxQuantity={maxQuantity} onChange={this.setQuantity} />
                    <div className="button-addtocart">
                      <AddToCartButton product={product} variant={selectedVariant} addCartItem={this.addToCart} isAllOptionsSelected={isAllOptionsSelected} />
                    </div>
                    {compatibilityWidget()}
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="section section-product-description">
            <div className="container">
              <div className="content">
                <div className="columns">
                  <div className="column is-7">
                    <Description description={product.description} />
                  </div>
                  <div className="column is-5">
                    <Attributes attributes={product.attributes} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section section-product">
            <div className="container">
              <div className="content">
                <div className="columns">
                  {commentaries()}
                </div>
              </div>
            </div>
          </section>

          <RelatedProducts
            settings={settings}
            addCartItem={this.addToCart}
            ids={product.related_product_ids}
            limit={10}
          />

          {themeSettings.show_viewed_products &&
            <ViewedProducts
              settings={settings}
              addCartItem={this.addToCart}
              product={product}
              limit={themeSettings.limit_viewed_products || 4}
            />
          }
        </Fragment>
      )
    } else {
      return null;
    }
  }
}
