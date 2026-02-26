import React from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import { ArrowRight, Utensils } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { restaurants } = useRestaurants();
    const featuredRestaurants = restaurants.filter(r => r.isActive).slice(0, 3);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-white pt-20 pb-24 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center bg-orange-100 text-orange-700 rounded-full p-2 mb-6">
                        <Utensils className="h-8 w-8" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-tight">
                        Your Culinary Adventure <br /> Starts Here
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500">
                        Discover and order from the finest local restaurants. Quick, easy, and delicious, delivered right to your doorstep.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link 
                            to={restaurants.length > 0 ? `/restaurant/${restaurants.find(r => r.isActive)?.slug}` : '/'}
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-orange-600 hover:bg-orange-700 transition shadow-lg"
                        >
                            Order Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Restaurants Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">Featured Restaurants</h2>
                        <p className="text-gray-500 mt-2">Handpicked for an exceptional dining experience.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredRestaurants.map(restaurant => (
                            <Link 
                                key={restaurant.id} 
                                to={`/restaurant/${restaurant.slug}`}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img src={restaurant.bannerImage} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <img src={restaurant.logo} alt={`${restaurant.name} logo`} className="h-12 w-12 rounded-full border-2 border-white -mt-12 shadow-md" />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine.join(', ')}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                                        <span>{restaurant.deliveryTime}</span>
                                        <span className="font-semibold text-orange-600 flex items-center">
                                            View Menu <ArrowRight className="ml-1 h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

             {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CraveWave. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
