'use client';
import React, { useState } from 'react';

export default function ManagePage() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Management Dashboard</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                
                <div className="space-y-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={() => console.log('Action button clicked')}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Perform Action'}
                    </button>
                    
                    <div className="mt-4">
                        <p className="text-gray-600">
                            Use this dashboard to manage your schedule settings and configurations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}