'use strict';

const _ = require('lodash');
const MWS = require('../MWS');
const parsers = require('./parsers');

class Orders extends MWS {
  constructor(options) {
    super(options);
    this.BASE_REQUEST = {
      method: 'POST',
      path: 'Orders',
      version: '2013-09-01',
      query: {}
    };

    /** Bind Context */
    this.listOrders = this.listOrders.bind(this);
    this.listOrderItems = this.listOrderItems.bind(this);
  }

  /**
   * Gets a list of orders from the mws orders api
   * @param {object} params - object that contains the details of the request
   * @param {array} params.MarketplaceId - array of relevant marketplaceIDs
   * @param {array} params.OrderStatus - array of order statuses
   * @param {array} params.FulfillmentChannel - array of Fulfillment Channels
   * @param {string} params.CreatedAfter - optional ISO timestamp
   * @param {string} params.CreatedBefore - optional ISO timestamp
   * @param {string} params.LastUpdatedAfter - optional ISO timestamp
   * @param {string} params.LastUpdatedBefore - optional ISO timestamp
   */
  async listOrders(params) {
    const request = Object.assign({}, this.BASE_REQUEST);
    request.query.Action = 'ListOrders';

    /** Assign Marketplace Id(s) */
    if (!params.MarketplaceId) {
      request.query['MarketplaceId.Id.1'] = this.marketplaceId
    } else if (typeof params.MarketplaceId !== 'object' || _.keys(params.MarketplaceId)[0] !== '0') {
      throw new Error('params.MarketplaceId must be an array');
    } else {
      params.MarketplaceId.forEach((marketPlace, id) => {
        request.query[`MarketplaceId.Id.${++id}`] = marketPlace;
      });

      delete params.MarketplaceId;
    }

    /** Assign the Order Status(es) */
    if (params.OrderStatus) {
      if (typeof params.OrderStatus !== 'object' || _.keys(params.OrderStatus)[0] !== '0') {
        throw new Error('params.OrderStatus must be an array');
      } else {
        params.OrderStatus.forEach((status, id) => {
          request.query[`OrderStatus.Status.${++id}`] = status;
        });

        delete params.OrderStatus;
      }
    }

    /** Assign the Fulfillment Channel(s) */
    if (params.FulfillmentChannel) {
      if (typeof params.FulfillmentChannel !== 'object' || _.keys(params.FulfillmentChannel)[0] !== '0') {
        throw new Error('params.FulfillmentChannel must be an array');
      } else {
        params.FulfillmentChannel.forEach((channel, id) => {
          request.query[`FulfillmentChannel.Channel.${++id}`] = channel;
        });

        delete params.FulfillmentChannel;
      }
    }
    
    /** Assign params to query */
    _.keys(params).forEach(key => {
      if (typeof params[key] === 'string' || typeof params[key] === 'number') {
        request.query[key] = params[key]
      }
    });

    let response = await this.makeCall(request);
    response = await Orders.__xml_to_json(response);
    return parsers.listOrders(response);
  }


  async listOrderItems(AmazonOrderId) {
    const request = Object.assign({}, this.BASE_REQUEST);
    request.query.Action = 'ListOrderItems';
    request.query.AmazonOrderId = AmazonOrderId;
    // request.query.MarketplaceId = null;

    let response = await this.makeCall(request);
    response = await Orders.__xml_to_json(response);
    return parsers.listOrderItems(response);
  }

}

module.exports = Orders;