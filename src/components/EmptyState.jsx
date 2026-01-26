import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
    icon = '🏜️',
    title = 'No Results Found',
    message = 'We couldnt find any assets matching your filters. Try resetting the matrix.',
    actionLabel = 'Reset Matrix',
    onAction
}) {
    return (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-charcoal-100 shadow-sm w-full">
            <div className="text-6xl mb-6">{icon}</div>
            <h3 className="text-2xl font-black text-charcoal-900 mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-charcoal-500 font-medium mb-10 max-w-sm mx-auto">
                {message}
            </p>
            {onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
