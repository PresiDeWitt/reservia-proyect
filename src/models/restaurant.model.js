/**
 * Restaurant Model
 * Handles data fetching and business logic for restaurants.
 */
class RestaurantModel {
    constructor() {
        this.restaurants = [];
    }

    async fetchRestaurants() {
        // Future implementation for API call
        console.log("Fetching restaurants...");
        return this.restaurants;
    }
}

export default new RestaurantModel();
