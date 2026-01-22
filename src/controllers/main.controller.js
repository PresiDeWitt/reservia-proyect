/**
 * Main Controller
 * Orchestrates interaction between Models and Views.
 */
import RestaurantModel from '../models/restaurant.model.js';

class MainController {
    constructor() {
        this.init();
    }

    init() {
        console.log("ReserVia Controller initialized.");
    }

    async loadHome() {
        const data = await RestaurantModel.fetchRestaurants();
        // Handle UI update
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appController = new MainController();
});
