import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    LightBulbIcon,
    BuildingStorefrontIcon,
    Squares2X2Icon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    LightBulbIcon as LightBulbSolid,
    BuildingStorefrontIcon as BuildingStorefrontSolid,
    Squares2X2Icon as SquaresSolid,
    UserCircleIcon as UserSolid
} from '@heroicons/react/24/solid';

export default function MobileBottomNav() {
    const location = useLocation();
    const { pathname } = location;

    const navItems = [
        { name: 'Home', path: '/', icon: HomeIcon, activeIcon: HomeSolid },
        { name: 'Ideas', path: '/ideas', icon: LightBulbIcon, activeIcon: LightBulbSolid },
        { name: 'Franchise', path: '/franchise', icon: BuildingStorefrontIcon, activeIcon: BuildingStorefrontSolid },
        { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Profile', path: '/edit-profile', icon: UserCircleIcon, activeIcon: UserSolid },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-charcoal-100 pb-safe pt-2 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    const Icon = isActive ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-primary-600 scale-105' : 'text-charcoal-400 hover:text-charcoal-600'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-lg' : ''}`} />
                            <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
                            {isActive && (
                                <div className="absolute -bottom-2 w-1 h-1 bg-primary-600 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
            {/* Safe area spacing for iOS home bar */}
            <div className="h-5 w-full" />
        </div>
    );
}
